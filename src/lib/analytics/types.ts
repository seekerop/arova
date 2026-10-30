export type DeviceType = "desktop" | "mobile" | "tablet";

export type TrafficSourceCategory =
  | "direct"
  | "organic_search"
  | "paid_search"
  | "social"
  | "referral"
  | "email"
  | "campaign"
  | "other";

export interface AnalyticsEventPayload {
  eventName: string;
  visitorId: string;
  sessionId: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  eventProperties?: Record<string, any>;
  screenResolution?: string;
  viewportSize?: string;
  scrollDepth?: number;
  engagementTimeMs?: number;
  timestamp?: string;
  // UTM parameters if present on the landing
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface ClientTrackRequest {
  events: AnalyticsEventPayload[];
}

export type AnalyticsDatePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "this_month"
  | "last_month"
  | "custom";

export interface DateRangeFilter {
  preset: AnalyticsDatePreset;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

export interface MetricComparison {
  current: number;
  previous: number | null;
  percentageChange: number | null;
  trend: "up" | "down" | "neutral";
}

export interface AnalyticsOverviewKPIs {
  totalVisitors: MetricComparison;
  uniqueVisitors: MetricComparison;
  totalPageViews: MetricComparison;
  totalSessions: MetricComparison;
  avgSessionDurationSeconds: MetricComparison;
  bounceRate: MetricComparison;
  hasHistoricalComparison: boolean;
}

export interface TimeSeriesDataPoint {
  timestamp: string; // ISO string or period label
  label: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
}

export interface RealtimeAnalytics {
  activeVisitorsRightNow: number; // last 5 minutes
  visitorsLast30Minutes: number;
  pagesActiveCount: number;
  topActivePages: Array<{
    pagePath: string;
    pageTitle: string;
    activeVisitors: number;
  }>;
  recentEvents: Array<{
    id: string;
    eventName: string;
    pagePath: string;
    pageTitle?: string;
    deviceType?: string;
    browser?: string;
    country?: string;
    city?: string;
    timestamp: string;
  }>;
}

export interface TrafficSourceBreakdown {
  category: TrafficSourceCategory;
  name: string;
  visitors: number;
  sessions: number;
  percentage: number;
}

export interface PageAnalyticsRow {
  pagePath: string;
  pageTitle: string;
  pageViews: number;
  uniqueVisitors: number;
  avgEngagementTimeSeconds: number;
  bounceRate: number;
}

export interface GeographicBreakdown {
  topCountries: Array<{
    country: string;
    countryCode?: string;
    visitors: number;
    sessions: number;
    percentage: number;
  }>;
  topCities: Array<{
    city: string;
    country: string;
    visitors: number;
    sessions: number;
    percentage: number;
  }>;
}

export interface DeviceBreakdown {
  deviceTypes: Array<{
    type: DeviceType;
    visitors: number;
    sessions: number;
    percentage: number;
  }>;
  browsers: Array<{
    browser: string;
    visitors: number;
    sessions: number;
    percentage: number;
  }>;
  operatingSystems: Array<{
    os: string;
    visitors: number;
    sessions: number;
    percentage: number;
  }>;
}

export interface CampaignPerformanceRow {
  campaignName: string;
  source: string;
  medium: string;
  visitors: number;
  sessions: number;
  pageViews: number;
}

export interface LandingExitPages {
  landingPages: Array<{
    pagePath: string;
    pageTitle: string;
    sessions: number;
    bounceRate: number;
  }>;
  exitPages: Array<{
    pagePath: string;
    pageTitle: string;
    exits: number;
    exitRate: number;
  }>;
}
