-- ==============================================================================
-- AROVA PRODUCTION ANALYTICS SCHEMA
-- First-party privacy-conscious traffic tracking, sessions, and engagement analytics
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_visitors (
    id VARCHAR(64) PRIMARY KEY,
    first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_sessions INT NOT NULL DEFAULT 1,
    total_page_views INT NOT NULL DEFAULT 1,
    first_traffic_source VARCHAR(64) DEFAULT 'direct',
    last_traffic_source VARCHAR(64) DEFAULT 'direct',
    country VARCHAR(64),
    region VARCHAR(64),
    city VARCHAR(64),
    device_type VARCHAR(32),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_sessions (
    id VARCHAR(64) PRIMARY KEY,
    visitor_id VARCHAR(64) NOT NULL REFERENCES public.analytics_visitors(id) ON DELETE CASCADE,
    entry_page TEXT NOT NULL,
    exit_page TEXT NOT NULL,
    referrer TEXT,
    referring_domain TEXT,
    traffic_source VARCHAR(64) NOT NULL DEFAULT 'direct',
    campaign_source TEXT,
    campaign_medium TEXT,
    campaign_name TEXT,
    campaign_term TEXT,
    campaign_content TEXT,
    device_type VARCHAR(32),
    browser VARCHAR(64),
    browser_version VARCHAR(32),
    operating_system VARCHAR(64),
    country VARCHAR(64),
    region VARCHAR(64),
    city VARCHAR(64),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INT NOT NULL DEFAULT 0,
    page_views INT NOT NULL DEFAULT 1,
    events_count INT NOT NULL DEFAULT 1,
    max_scroll_depth INT DEFAULT 0,
    is_bounce BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(64) NOT NULL,
    visitor_id VARCHAR(64) NOT NULL REFERENCES public.analytics_visitors(id) ON DELETE CASCADE,
    session_id VARCHAR(64) NOT NULL REFERENCES public.analytics_sessions(id) ON DELETE CASCADE,
    page_path TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    referring_domain TEXT,
    event_properties JSONB DEFAULT '{}'::jsonb,
    device_type VARCHAR(32),
    browser VARCHAR(64),
    operating_system VARCHAR(64),
    screen_resolution VARCHAR(32),
    viewport_size VARCHAR(32),
    country VARCHAR(64),
    region VARCHAR(64),
    city VARCHAR(64),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR AGGREGATION & REPORTING EFFICIENCY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON public.analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events(event_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON public.analytics_events(page_path);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_activity ON public.analytics_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_traffic_source ON public.analytics_sessions(traffic_source);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_campaign ON public.analytics_sessions(campaign_name);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON public.analytics_sessions(visitor_id);

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen ON public.analytics_visitors(last_seen_at DESC);
