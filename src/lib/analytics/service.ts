import { getDbPool } from "@/lib/db";
import {
  AnalyticsEventPayload,
  AnalyticsDatePreset,
  AnalyticsOverviewKPIs,
  TimeSeriesDataPoint,
  RealtimeAnalytics,
  TrafficSourceBreakdown,
  PageAnalyticsRow,
  GeographicBreakdown,
  DeviceBreakdown,
  CampaignPerformanceRow,
  LandingExitPages,
  MetricComparison,
  TrafficSourceCategory,
} from "./types";
import {
  classifyTrafficSource,
  parseUserAgent,
  resolveGeolocation,
  extractHostname,
} from "./classifier";

// ==============================================================================
// DATE RANGE CALCULATION HELPERS
// ==============================================================================

export function calculateDateRanges(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): {
  currentStart: Date;
  currentEnd: Date;
  previousStart: Date;
  previousEnd: Date;
  interval: "hour" | "day" | "week";
} {
  const now = new Date();
  let currentStart = new Date();
  let currentEnd = new Date(now);
  let interval: "hour" | "day" | "week" = "day";

  switch (preset) {
    case "today": {
      currentStart = new Date(now);
      currentStart.setHours(0, 0, 0, 0);
      interval = "hour";
      break;
    }
    case "yesterday": {
      currentStart = new Date(now);
      currentStart.setDate(now.getDate() - 1);
      currentStart.setHours(0, 0, 0, 0);

      currentEnd = new Date(now);
      currentEnd.setDate(now.getDate() - 1);
      currentEnd.setHours(23, 59, 59, 999);
      interval = "hour";
      break;
    }
    case "7d": {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      interval = "day";
      break;
    }
    case "30d": {
      currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      interval = "day";
      break;
    }
    case "90d": {
      currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      interval = "day";
      break;
    }
    case "this_month": {
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      interval = "day";
      break;
    }
    case "last_month": {
      currentStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      currentEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      interval = "day";
      break;
    }
    case "custom": {
      if (customStart && customEnd) {
        currentStart = new Date(customStart);
        currentEnd = new Date(customEnd);
      } else {
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      const diffDays = Math.ceil(
        (currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      interval = diffDays <= 2 ? "hour" : diffDays > 90 ? "week" : "day";
      break;
    }
    default: {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      interval = "day";
    }
  }

  // Calculate equivalent previous period of exact same duration
  const durationMs = currentEnd.getTime() - currentStart.getTime();
  const previousEnd = new Date(currentStart.getTime());
  const previousStart = new Date(previousEnd.getTime() - durationMs);

  return {
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    interval,
  };
}

function calculateMetricComparison(current: number, previous: number | null): MetricComparison {
  if (previous === null || previous === undefined || isNaN(previous) || previous === 0) {
    return {
      current,
      previous: previous ?? null,
      percentageChange: null,
      trend: "neutral",
    };
  }

  const change = ((current - previous) / previous) * 100;
  const roundedChange = Math.round(change * 10) / 10;

  return {
    current,
    previous,
    percentageChange: roundedChange,
    trend: roundedChange > 0 ? "up" : roundedChange < 0 ? "down" : "neutral",
  };
}

// ==============================================================================
// EVENT INGESTION
// ==============================================================================

export async function ingestAnalyticsEvent(
  payload: AnalyticsEventPayload,
  headers: Headers,
  siteHost?: string | null
): Promise<{ success: boolean; eventId?: string; ignored?: boolean }> {
  const pool = getDbPool();

  const userAgent = headers.get("user-agent") || "";
  const { deviceType, browser, browserVersion, operatingSystem, isBot } = parseUserAgent(userAgent);

  // Disregard automated search crawlers / bots from polluting real metrics
  if (isBot) {
    return { success: true, ignored: true };
  }

  const { country, region, city } = resolveGeolocation(headers);

  const traffic = classifyTrafficSource({
    referrer: payload.referrer,
    siteHost: siteHost || headers.get("host"),
    utmSource: payload.utmSource,
    utmMedium: payload.utmMedium,
    utmCampaign: payload.utmCampaign,
  });

  const now = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const visitorId = payload.visitorId.slice(0, 64);
  const sessionId = payload.sessionId.slice(0, 64);
  const eventName = payload.eventName.slice(0, 64);
  const pagePath = payload.pagePath || "/";
  const pageTitle = payload.pageTitle || pagePath;
  const eventProps = payload.eventProperties || {};

  // 1. Upsert Visitor
  await pool.query(
    `
    INSERT INTO public.analytics_visitors (
      id, first_seen_at, last_seen_at, total_sessions, total_page_views,
      first_traffic_source, last_traffic_source, country, region, city, device_type
    ) VALUES (
      $1, $2, $2, 1, $3, $4, $4, $5, $6, $7, $8
    )
    ON CONFLICT (id) DO UPDATE SET
      last_seen_at = $2,
      total_page_views = analytics_visitors.total_page_views + $3,
      last_traffic_source = $4,
      country = COALESCE(analytics_visitors.country, EXCLUDED.country),
      city = COALESCE(analytics_visitors.city, EXCLUDED.city),
      updated_at = $2
  `,
    [
      visitorId,
      now,
      eventName === "page_view" ? 1 : 0,
      traffic.category,
      country,
      region,
      city,
      deviceType,
    ]
  );

  // 2. Upsert Session
  const isPageView = eventName === "page_view";
  const scrollDepth = payload.scrollDepth || 0;

  await pool.query(
    `
    INSERT INTO public.analytics_sessions (
      id, visitor_id, entry_page, exit_page, referrer, referring_domain,
      traffic_source, campaign_source, campaign_medium, campaign_name, campaign_term, campaign_content,
      device_type, browser, browser_version, operating_system,
      country, region, city,
      started_at, last_activity_at, duration_seconds, page_views, events_count, max_scroll_depth, is_bounce
    ) VALUES (
      $1, $2, $3, $3, $4, $5,
      $6, $7, $8, $9, $10, $11,
      $12, $13, $14, $15,
      $16, $17, $18,
      $19, $19, 0, $20, 1, $21, true
    )
    ON CONFLICT (id) DO UPDATE SET
      exit_page = $3,
      last_activity_at = $19,
      duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM ($19 - analytics_sessions.started_at))::int),
      page_views = analytics_sessions.page_views + $20,
      events_count = analytics_sessions.events_count + 1,
      max_scroll_depth = GREATEST(analytics_sessions.max_scroll_depth, $21),
      is_bounce = CASE
        WHEN (analytics_sessions.page_views + $20) > 1 THEN false
        WHEN EXTRACT(EPOCH FROM ($19 - analytics_sessions.started_at)) > 15 THEN false
        WHEN GREATEST(analytics_sessions.max_scroll_depth, $21) >= 50 THEN false
        ELSE analytics_sessions.is_bounce
      END,
      updated_at = $19
  `,
    [
      sessionId,
      visitorId,
      pagePath,
      payload.referrer || null,
      traffic.referringDomain,
      traffic.category,
      payload.utmSource || null,
      payload.utmMedium || null,
      payload.utmCampaign || null,
      payload.utmTerm || null,
      payload.utmContent || null,
      deviceType,
      browser,
      browserVersion,
      operatingSystem,
      country,
      region,
      city,
      now,
      isPageView ? 1 : 0,
      scrollDepth,
    ]
  );

  // 3. Insert Event Record
  const insertRes = await pool.query(
    `
    INSERT INTO public.analytics_events (
      event_name, visitor_id, session_id, page_path, page_title,
      referrer, referring_domain, event_properties,
      device_type, browser, operating_system, screen_resolution, viewport_size,
      country, region, city, timestamp
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11, $12, $13,
      $14, $15, $16, $17
    )
    RETURNING id
  `,
    [
      eventName,
      visitorId,
      sessionId,
      pagePath,
      pageTitle,
      payload.referrer || null,
      traffic.referringDomain,
      JSON.stringify(eventProps),
      deviceType,
      browser,
      operatingSystem,
      payload.screenResolution || null,
      payload.viewportSize || null,
      country,
      region,
      city,
      now,
    ]
  );

  return { success: true, eventId: insertRes.rows[0]?.id };
}

export async function ingestBatchAnalyticsEvents(
  events: AnalyticsEventPayload[],
  headers: Headers,
  siteHost?: string | null
): Promise<{ success: boolean; processed: number }> {
  let count = 0;
  for (const event of events) {
    const res = await ingestAnalyticsEvent(event, headers, siteHost);
    if (res.success && !res.ignored) {
      count++;
    }
  }
  return { success: true, processed: count };
}

// ==============================================================================
// ADMIN ANALYTICS QUERIES
// ==============================================================================

/**
 * Overview KPIs with period-over-period comparisons
 */
export async function getAnalyticsOverview(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): Promise<AnalyticsOverviewKPIs> {
  const pool = getDbPool();
  const { currentStart, currentEnd, previousStart, previousEnd } = calculateDateRanges(
    preset,
    customStart,
    customEnd
  );

  const queryMetrics = async (start: Date, end: Date) => {
    const res = await pool.query(
      `
      SELECT
        COUNT(DISTINCT visitor_id)::int AS unique_visitors,
        COUNT(id)::int AS total_sessions,
        COALESCE(SUM(page_views), 0)::int AS total_page_views,
        COALESCE(AVG(duration_seconds), 0)::float AS avg_duration,
        COUNT(*) FILTER (WHERE is_bounce = true)::int AS bounces
      FROM public.analytics_sessions
      WHERE started_at >= $1 AND started_at <= $2
    `,
      [start, end]
    );

    const row = res.rows[0];
    const sessions = row?.total_sessions || 0;
    const bounceRate = sessions > 0 ? (row.bounces / sessions) * 100 : 0;

    return {
      uniqueVisitors: row?.unique_visitors || 0,
      totalSessions: sessions,
      totalPageViews: row?.total_page_views || 0,
      avgSessionDuration: Math.round(row?.avg_duration || 0),
      bounceRate: Math.round(bounceRate * 10) / 10,
    };
  };

  const [current, previous] = await Promise.all([
    queryMetrics(currentStart, currentEnd),
    queryMetrics(previousStart, previousEnd),
  ]);

  const hasHistoricalComparison = previous.totalSessions > 0;

  return {
    totalVisitors: calculateMetricComparison(
      current.totalSessions,
      hasHistoricalComparison ? previous.totalSessions : null
    ),
    uniqueVisitors: calculateMetricComparison(
      current.uniqueVisitors,
      hasHistoricalComparison ? previous.uniqueVisitors : null
    ),
    totalPageViews: calculateMetricComparison(
      current.totalPageViews,
      hasHistoricalComparison ? previous.totalPageViews : null
    ),
    totalSessions: calculateMetricComparison(
      current.totalSessions,
      hasHistoricalComparison ? previous.totalSessions : null
    ),
    avgSessionDurationSeconds: calculateMetricComparison(
      current.avgSessionDuration,
      hasHistoricalComparison ? previous.avgSessionDuration : null
    ),
    bounceRate: calculateMetricComparison(
      current.bounceRate,
      hasHistoricalComparison ? previous.bounceRate : null
    ),
    hasHistoricalComparison,
  };
}

/**
 * Time-series charting points
 */
export async function getTimeSeriesMetrics(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): Promise<TimeSeriesDataPoint[]> {
  const pool = getDbPool();
  const { currentStart, currentEnd, interval } = calculateDateRanges(
    preset,
    customStart,
    customEnd
  );

  let dateTrunc = "day";
  if (interval === "hour") dateTrunc = "hour";
  else if (interval === "week") dateTrunc = "week";

  const res = await pool.query(
    `
    SELECT
      DATE_TRUNC('${dateTrunc}', started_at) AS period,
      COUNT(DISTINCT visitor_id)::int AS unique_visitors,
      COUNT(id)::int AS sessions,
      COALESCE(SUM(page_views), 0)::int AS page_views
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY period
    ORDER BY period ASC
  `,
    [currentStart, currentEnd]
  );

  const rowMap = new Map<string, any>();
  for (const r of res.rows) {
    const key = new Date(r.period).toISOString();
    rowMap.set(key, r);
  }

  // Generate continuous timeline buckets so zero points aren't skipped
  const points: TimeSeriesDataPoint[] = [];
  const cursor = new Date(currentStart);

  if (interval === "hour") {
    cursor.setMinutes(0, 0, 0);
    while (cursor <= currentEnd) {
      const key = cursor.toISOString();
      const match = rowMap.get(key);
      const hoursStr = cursor.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      points.push({
        timestamp: key,
        label: hoursStr,
        visitors: match?.sessions || 0,
        uniqueVisitors: match?.unique_visitors || 0,
        pageViews: match?.page_views || 0,
        sessions: match?.sessions || 0,
      });
      cursor.setHours(cursor.getHours() + 1);
    }
  } else {
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= currentEnd) {
      const key = cursor.toISOString();
      const match = rowMap.get(key);
      const dayLabel = cursor.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });

      points.push({
        timestamp: key,
        label: dayLabel,
        visitors: match?.sessions || 0,
        uniqueVisitors: match?.unique_visitors || 0,
        pageViews: match?.page_views || 0,
        sessions: match?.sessions || 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return points;
}

/**
 * Real-time monitoring metrics
 */
export async function getRealtimeAnalytics(): Promise<RealtimeAnalytics> {
  const pool = getDbPool();

  // Active visitors in last 5 minutes
  const activeRes = await pool.query(`
    SELECT
      COUNT(DISTINCT visitor_id)::int AS active_visitors,
      COUNT(DISTINCT exit_page)::int AS active_pages_count
    FROM public.analytics_sessions
    WHERE last_activity_at >= NOW() - INTERVAL '5 minutes'
  `);

  const last30Res = await pool.query(`
    SELECT COUNT(DISTINCT visitor_id)::int AS count_30m
    FROM public.analytics_sessions
    WHERE last_activity_at >= NOW() - INTERVAL '30 minutes'
  `);

  // Top pages currently active
  const topActivePagesRes = await pool.query(`
    SELECT
      exit_page AS page_path,
      COUNT(DISTINCT visitor_id)::int AS active_visitors
    FROM public.analytics_sessions
    WHERE last_activity_at >= NOW() - INTERVAL '5 minutes'
    GROUP BY exit_page
    ORDER BY active_visitors DESC
    LIMIT 5
  `);

  // Recent 15 events
  const recentEventsRes = await pool.query(`
    SELECT
      id, event_name, page_path, page_title, device_type, browser, country, city, timestamp
    FROM public.analytics_events
    ORDER BY timestamp DESC
    LIMIT 15
  `);

  return {
    activeVisitorsRightNow: activeRes.rows[0]?.active_visitors || 0,
    visitorsLast30Minutes: last30Res.rows[0]?.count_30m || 0,
    pagesActiveCount: activeRes.rows[0]?.active_pages_count || 0,
    topActivePages: topActivePagesRes.rows.map((r) => ({
      pagePath: r.page_path,
      pageTitle: r.page_path === "/" ? "Home" : r.page_path,
      activeVisitors: r.active_visitors,
    })),
    recentEvents: recentEventsRes.rows.map((r) => ({
      id: r.id,
      eventName: r.event_name,
      pagePath: r.page_path,
      pageTitle: r.page_title,
      deviceType: r.device_type,
      browser: r.browser,
      country: r.country,
      city: r.city,
      timestamp: r.timestamp,
    })),
  };
}

/**
 * Traffic sources breakdown
 */
export async function getTrafficSources(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): Promise<TrafficSourceBreakdown[]> {
  const pool = getDbPool();
  const { currentStart, currentEnd } = calculateDateRanges(preset, customStart, customEnd);

  const res = await pool.query(
    `
    SELECT
      traffic_source,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY traffic_source
    ORDER BY sessions DESC
  `,
    [currentStart, currentEnd]
  );

  const totalSessions = res.rows.reduce((acc, curr) => acc + curr.sessions, 0);

  const nameMap: Record<TrafficSourceCategory, string> = {
    direct: "Direct Traffic",
    organic_search: "Organic Search",
    paid_search: "Paid Search",
    social: "Social Media",
    referral: "Referral Traffic",
    email: "Email Marketing",
    campaign: "Other Campaigns",
    other: "Other",
  };

  return res.rows.map((r) => ({
    category: r.traffic_source as TrafficSourceCategory,
    name: nameMap[r.traffic_source as TrafficSourceCategory] || r.traffic_source,
    visitors: r.visitors,
    sessions: r.sessions,
    percentage: totalSessions > 0 ? Math.round((r.sessions / totalSessions) * 1000) / 10 : 0,
  }));
}

/**
 * Top viewed pages
 */
export async function getTopPages(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string,
  sortBy: "views" | "visitors" = "views",
  limit = 20
): Promise<PageAnalyticsRow[]> {
  const pool = getDbPool();
  const { currentStart, currentEnd } = calculateDateRanges(preset, customStart, customEnd);

  const orderClause = sortBy === "visitors" ? "unique_visitors DESC" : "page_views DESC";

  const res = await pool.query(
    `
    SELECT
      e.page_path,
      MAX(e.page_title) AS page_title,
      COUNT(*)::int AS page_views,
      COUNT(DISTINCT e.visitor_id)::int AS unique_visitors,
      COALESCE(AVG(s.duration_seconds), 0)::int AS avg_duration,
      (COUNT(*) FILTER (WHERE s.is_bounce = true)::float / GREATEST(1, COUNT(*)::float) * 100)::float AS bounce_rate
    FROM public.analytics_events e
    LEFT JOIN public.analytics_sessions s ON e.session_id = s.id
    WHERE e.event_name = 'page_view' AND e.timestamp >= $1 AND e.timestamp <= $2
    GROUP BY e.page_path
    ORDER BY ${orderClause}
    LIMIT $3
  `,
    [currentStart, currentEnd, limit]
  );

  return res.rows.map((r) => ({
    pagePath: r.page_path,
    pageTitle: r.page_title || (r.page_path === "/" ? "Home" : r.page_path),
    pageViews: r.page_views,
    uniqueVisitors: r.unique_visitors,
    avgEngagementTimeSeconds: r.avg_duration,
    bounceRate: Math.round(r.bounce_rate * 10) / 10,
  }));
}

/**
 * Geographic breakdown (countries & cities)
 */
export async function getGeographicMetrics(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): Promise<GeographicBreakdown> {
  const pool = getDbPool();
  const { currentStart, currentEnd } = calculateDateRanges(preset, customStart, customEnd);

  const countriesRes = await pool.query(
    `
    SELECT
      COALESCE(country, 'Unknown') AS country,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY country
    ORDER BY visitors DESC
    LIMIT 10
  `,
    [currentStart, currentEnd]
  );

  const citiesRes = await pool.query(
    `
    SELECT
      COALESCE(city, 'Unknown') AS city,
      COALESCE(country, 'Unknown') AS country,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY city, country
    ORDER BY visitors DESC
    LIMIT 10
  `,
    [currentStart, currentEnd]
  );

  const totalVisitors = countriesRes.rows.reduce((acc, curr) => acc + curr.visitors, 0);

  return {
    topCountries: countriesRes.rows.map((r) => ({
      country: r.country,
      visitors: r.visitors,
      sessions: r.sessions,
      percentage: totalVisitors > 0 ? Math.round((r.visitors / totalVisitors) * 1000) / 10 : 0,
    })),
    topCities: citiesRes.rows.map((r) => ({
      city: r.city,
      country: r.country,
      visitors: r.visitors,
      sessions: r.sessions,
      percentage: totalVisitors > 0 ? Math.round((r.visitors / totalVisitors) * 1000) / 10 : 0,
    })),
  };
}

/**
 * Device, Browser, and OS analytics
 */
export async function getDeviceMetrics(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): Promise<DeviceBreakdown> {
  const pool = getDbPool();
  const { currentStart, currentEnd } = calculateDateRanges(preset, customStart, customEnd);

  const devicesRes = await pool.query(
    `
    SELECT
      COALESCE(device_type, 'desktop') AS device_type,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY device_type
    ORDER BY sessions DESC
  `,
    [currentStart, currentEnd]
  );

  const browsersRes = await pool.query(
    `
    SELECT
      COALESCE(browser, 'Other') AS browser,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY browser
    ORDER BY sessions DESC
    LIMIT 8
  `,
    [currentStart, currentEnd]
  );

  const osRes = await pool.query(
    `
    SELECT
      COALESCE(operating_system, 'Other') AS os,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY operating_system
    ORDER BY sessions DESC
    LIMIT 8
  `,
    [currentStart, currentEnd]
  );

  const totalSessions = devicesRes.rows.reduce((acc, curr) => acc + curr.sessions, 0);

  return {
    deviceTypes: devicesRes.rows.map((r) => ({
      type: r.device_type,
      visitors: r.visitors,
      sessions: r.sessions,
      percentage: totalSessions > 0 ? Math.round((r.sessions / totalSessions) * 1000) / 10 : 0,
    })),
    browsers: browsersRes.rows.map((r) => ({
      browser: r.browser,
      visitors: r.visitors,
      sessions: r.sessions,
      percentage: totalSessions > 0 ? Math.round((r.sessions / totalSessions) * 1000) / 10 : 0,
    })),
    operatingSystems: osRes.rows.map((r) => ({
      os: r.os,
      visitors: r.visitors,
      sessions: r.sessions,
      percentage: totalSessions > 0 ? Math.round((r.sessions / totalSessions) * 1000) / 10 : 0,
    })),
  };
}

/**
 * UTM campaign attribution performance
 */
export async function getCampaignMetrics(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string,
  sourceFilter?: string,
  mediumFilter?: string
): Promise<CampaignPerformanceRow[]> {
  const pool = getDbPool();
  const { currentStart, currentEnd } = calculateDateRanges(preset, customStart, customEnd);

  let sql = `
    SELECT
      COALESCE(campaign_name, 'No Campaign') AS campaign_name,
      COALESCE(campaign_source, 'direct') AS source,
      COALESCE(campaign_medium, 'none') AS medium,
      COUNT(DISTINCT visitor_id)::int AS visitors,
      COUNT(id)::int AS sessions,
      COALESCE(SUM(page_views), 0)::int AS page_views
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
      AND (campaign_name IS NOT NULL OR campaign_source IS NOT NULL)
  `;
  const params: any[] = [currentStart, currentEnd];

  if (sourceFilter && sourceFilter !== "all") {
    params.push(sourceFilter);
    sql += ` AND campaign_source = $${params.length}`;
  }

  if (mediumFilter && mediumFilter !== "all") {
    params.push(mediumFilter);
    sql += ` AND campaign_medium = $${params.length}`;
  }

  sql += `
    GROUP BY campaign_name, campaign_source, campaign_medium
    ORDER BY sessions DESC
    LIMIT 50
  `;

  const res = await pool.query(sql, params);

  return res.rows.map((r) => ({
    campaignName: r.campaign_name,
    source: r.source,
    medium: r.medium,
    visitors: r.visitors,
    sessions: r.sessions,
    pageViews: r.page_views,
  }));
}

/**
 * Landing and Exit pages
 */
export async function getLandingAndExitPages(
  preset: AnalyticsDatePreset = "7d",
  customStart?: string,
  customEnd?: string
): Promise<LandingExitPages> {
  const pool = getDbPool();
  const { currentStart, currentEnd } = calculateDateRanges(preset, customStart, customEnd);

  // Landing pages
  const landingRes = await pool.query(
    `
    SELECT
      entry_page AS page_path,
      COUNT(id)::int AS sessions,
      (COUNT(*) FILTER (WHERE is_bounce = true)::float / GREATEST(1, COUNT(*)::float) * 100)::float AS bounce_rate
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY entry_page
    ORDER BY sessions DESC
    LIMIT 10
  `,
    [currentStart, currentEnd]
  );

  // Exit pages
  const exitRes = await pool.query(
    `
    SELECT
      exit_page AS page_path,
      COUNT(id)::int AS exits,
      (COUNT(*)::float / GREATEST(1, (SELECT COUNT(*) FROM public.analytics_sessions WHERE started_at >= $1 AND started_at <= $2)::float) * 100)::float AS exit_rate
    FROM public.analytics_sessions
    WHERE started_at >= $1 AND started_at <= $2
    GROUP BY exit_page
    ORDER BY exits DESC
    LIMIT 10
  `,
    [currentStart, currentEnd]
  );

  return {
    landingPages: landingRes.rows.map((r) => ({
      pagePath: r.page_path,
      pageTitle: r.page_path === "/" ? "Home" : r.page_path,
      sessions: r.sessions,
      bounceRate: Math.round(r.bounce_rate * 10) / 10,
    })),
    exitPages: exitRes.rows.map((r) => ({
      pagePath: r.page_path,
      pageTitle: r.page_path === "/" ? "Home" : r.page_path,
      exits: r.exits,
      exitRate: Math.round(r.exit_rate * 10) / 10,
    })),
  };
}
