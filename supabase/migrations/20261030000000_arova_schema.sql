-- ==============================================================================
-- AROVA DATABASE SCHEMA — PRODUCTION MIGRATION
-- Ecosystem: Arenova Brand Universe
-- Technology: Supabase PostgreSQL with Strict RLS, Idempotency & Role Guards
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS & DOMAINS
CREATE TYPE arova_role AS ENUM ('admin', 'customer');
CREATE TYPE subscription_status AS ENUM ('created', 'authenticated', 'active', 'past_due', 'unpaid', 'cancelled', 'completed', 'expired');
CREATE TYPE quota_tx_type AS ENUM ('grant', 'reserve', 'consume', 'release', 'adjustment', 'refund');
CREATE TYPE lead_quality_status AS ENUM ('verified', 'unverified', 'flagged', 'inaccurate');
CREATE TYPE lead_availability_status AS ENUM ('available', 'reserved', 'claimed', 'archived', 'invalid');
CREATE TYPE lead_request_status AS ENUM ('Submitted', 'Under Review', 'Preparing', 'Ready', 'Unlocked', 'Rejected', 'Cancelled');
CREATE TYPE delivery_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE claim_status AS ENUM ('active', 'expired', 'released', 'extended');
CREATE TYPE payment_status AS ENUM ('pending', 'captured', 'failed', 'refunded');
CREATE TYPE webhook_event_status AS ENUM ('received', 'processed', 'failed', 'ignored');
CREATE TYPE feedback_issue_type AS ENUM ('inaccurate_phone', 'inaccurate_email', 'closed_business', 'wrong_category', 'duplicate', 'other');
CREATE TYPE feedback_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    company TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. USER ROLES (Strict admin gate - cannot be edited by normal users)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role arova_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. APPROVED CATEGORIES (Exactly 5 flat categories, NO subcategories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PLANS (Starter: 40 leads / 30 days @ 499 INR; Growth: 100 leads / 30 days @ 999 INR)
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- 'starter', 'growth'
    name TEXT NOT NULL,
    price_paise INT NOT NULL, -- 49900, 99900
    lead_allocation INT NOT NULL, -- 40, 100
    billing_period_days INT NOT NULL DEFAULT 30,
    razorpay_plan_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id),
    razorpay_subscription_id TEXT UNIQUE,
    razorpay_customer_id TEXT,
    status subscription_status NOT NULL DEFAULT 'created',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    disclosure_ack_at TIMESTAMPTZ,
    disclosure_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. QUOTA PERIODS
CREATE TABLE IF NOT EXISTS public.quota_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_allocation INT NOT NULL,
    consumed_quota INT NOT NULL DEFAULT 0,
    reserved_quota INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_quota_non_negative CHECK (
        consumed_quota >= 0 AND 
        reserved_quota >= 0 AND 
        (consumed_quota + reserved_quota) <= total_allocation
    )
);

-- 8. QUOTA LEDGER (Durable audit journal with idempotency)
CREATE TABLE IF NOT EXISTS public.quota_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quota_period_id UUID NOT NULL REFERENCES public.quota_periods(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- positive or negative
    balance_after INT NOT NULL,
    transaction_type quota_tx_type NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    reference_id TEXT,
    reference_type TEXT, -- 'lead_offer', 'lead_claim', 'request_unlock', 'subscription_grant', 'admin_adjustment'
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. IMPORT BATCHES
CREATE TABLE IF NOT EXISTS public.import_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    filename TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    total_rows INT NOT NULL DEFAULT 0,
    valid_rows INT NOT NULL DEFAULT 0,
    invalid_rows INT NOT NULL DEFAULT 0,
    duplicate_rows INT NOT NULL DEFAULT 0,
    imported_rows INT NOT NULL DEFAULT 0,
    skipped_rows INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'uploaded',
    error_summary JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. LEADS INVENTORY
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    generalized_requirement TEXT NOT NULL,
    estimated_value_paise BIGINT,
    estimated_value_currency TEXT NOT NULL DEFAULT 'INR',
    country TEXT NOT NULL DEFAULT 'India',
    state TEXT,
    city TEXT NOT NULL,
    business_type TEXT,
    tags TEXT[] DEFAULT '{}',
    source_name TEXT NOT NULL,
    source_url TEXT,
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verification_date DATE,
    data_quality_status lead_quality_status NOT NULL DEFAULT 'unverified',
    availability_status lead_availability_status NOT NULL DEFAULT 'available',
    import_batch_id UUID REFERENCES public.import_batches(id) ON DELETE SET NULL,
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning fast searching and filtering
CREATE INDEX IF NOT EXISTS idx_leads_category ON public.leads(category_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(availability_status);
CREATE INDEX IF NOT EXISTS idx_leads_city ON public.leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

-- 11. LEAD PRE-SUBSCRIPTION REQUESTS (1-9 leads preview before subscribe)
CREATE TABLE IF NOT EXISTS public.lead_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    requested_quantity INT NOT NULL CHECK (requested_quantity >= 1 AND requested_quantity <= 9),
    location_preference TEXT,
    notes TEXT,
    status lead_request_status NOT NULL DEFAULT 'Submitted',
    admin_rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. LEAD REQUEST ITEMS (Assigned leads locked until subscription)
CREATE TABLE IF NOT EXISTS public.lead_request_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.lead_requests(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(request_id, lead_id)
);

-- 13. LEAD DELIVERIES & OFFERS (48-hour response deadline)
CREATE TABLE IF NOT EXISTS public.lead_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    quota_period_id UUID NOT NULL REFERENCES public.quota_periods(id) ON DELETE CASCADE,
    delivered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    response_deadline TIMESTAMPTZ NOT NULL,
    status delivery_status NOT NULL DEFAULT 'pending',
    responded_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_deliveries_deadline ON public.lead_deliveries(response_deadline) WHERE status = 'pending';

-- 14. EXCLUSIVE LEAD CLAIMS (30 days exclusivity)
CREATE TABLE IF NOT EXISTS public.lead_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    delivery_id UUID REFERENCES public.lead_deliveries(id) ON DELETE SET NULL,
    quota_period_id UUID NOT NULL REFERENCES public.quota_periods(id) ON DELETE CASCADE,
    claimed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL,
    status claim_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_active_claim_lead ON public.lead_claims(lead_id) WHERE status = 'active';

-- 15. PAYMENTS RECORD
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    amount_paise INT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'pending',
    error_code TEXT,
    error_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. PAYMENT WEBHOOK EVENTS (Idempotent processing)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature TEXT NOT NULL,
    status webhook_event_status NOT NULL DEFAULT 'received',
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. DELIVERY SCHEDULE RUNS & LOGS
CREATE TABLE IF NOT EXISTS public.delivery_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trigger_type TEXT NOT NULL DEFAULT 'cron', -- 'cron', 'manual'
    status TEXT NOT NULL DEFAULT 'started',
    candidates_evaluated INT NOT NULL DEFAULT 0,
    offers_created INT NOT NULL DEFAULT 0,
    offers_expired INT NOT NULL DEFAULT 0,
    claims_expired INT NOT NULL DEFAULT 0,
    errors_count INT NOT NULL DEFAULT 0,
    log_summary JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID REFERENCES public.delivery_runs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. LEAD ACCURACY FEEDBACK & REPLACEMENTS
CREATE TABLE IF NOT EXISTS public.lead_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE RESTRICT,
    issue_type feedback_issue_type NOT NULL,
    description TEXT NOT NULL,
    status feedback_status NOT NULL DEFAULT 'pending',
    admin_resolution_notes TEXT,
    replacement_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 21. USER PREFERENCES
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    location_preferences TEXT[] DEFAULT '{}',
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quota_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Helper security function: Check if current auth user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view & edit own profile; admins can view all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: Only read own role; admins can view and manage
CREATE POLICY "Users view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Only admins manage roles" ON public.user_roles FOR ALL USING (public.is_admin());

-- Categories & Plans: Everyone can read active items
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin());

CREATE POLICY "Public read active plans" ON public.plans FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL USING (public.is_admin());

-- Subscriptions: User sees own, admin sees all
CREATE POLICY "Users see own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());

-- Quota Periods & Ledger: User sees own, admin sees all
CREATE POLICY "Users see own quota" ON public.quota_periods FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users see own ledger" ON public.quota_ledger FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Lead Requests: User sees and inserts own
CREATE POLICY "Users see own requests" ON public.lead_requests FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert own requests" ON public.lead_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own active requests" ON public.lead_requests FOR UPDATE USING (auth.uid() = user_id AND status = 'Submitted');
CREATE POLICY "Admins manage requests" ON public.lead_requests FOR ALL USING (public.is_admin());

-- Deliveries & Claims: User sees own
CREATE POLICY "Users see own deliveries" ON public.lead_deliveries FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users see own claims" ON public.lead_claims FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Feedback & Notifications: User sees own
CREATE POLICY "Users see own feedback" ON public.lead_feedback FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users insert feedback" ON public.lead_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users see own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- User Preferences: User manages own
CREATE POLICY "Users manage preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- Admin-only tables:
CREATE POLICY "Admin only access import_batches" ON public.import_batches FOR ALL USING (public.is_admin());
CREATE POLICY "Admin only access delivery_runs" ON public.delivery_runs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin only access delivery_logs" ON public.delivery_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin only access audit_logs" ON public.audit_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Admin only access webhooks" ON public.payment_webhook_events FOR ALL USING (public.is_admin());
CREATE POLICY "Admin only manage leads table" ON public.leads FOR ALL USING (public.is_admin());

-- Lead Privacy: Clients querying leads directly only see safe preview unless they hold an active claim
CREATE POLICY "Users view claimed leads or safe preview" ON public.leads FOR SELECT USING (
    public.is_admin() OR 
    EXISTS (
        SELECT 1 FROM public.lead_claims 
        WHERE lead_claims.lead_id = leads.id AND lead_claims.user_id = auth.uid() AND lead_claims.status = 'active'
    )
);

-- ==============================================================================
-- SEED DATA: 5 APPROVED CATEGORIES & 2 SUBSCRIPTION PLANS
-- ==============================================================================

INSERT INTO public.categories (slug, name, description, display_order) VALUES
('programming-software', 'Programming & Software', 'Custom software, web applications, backend APIs, mobile development, and full-stack engineering leads.', 1),
('video-editing-production', 'Video Editing & Production', 'Commercial video editing, motion design, YouTube production, reels/shorts editing, and post-production leads.', 2),
('digital-marketing-seo', 'Digital Marketing & SEO', 'Performance marketing, search engine optimization, Google/Meta Ads management, and growth marketing leads.', 3),
('website-ecommerce', 'Website & E-commerce', 'Shopify stores, WooCommerce, high-converting landing pages, and responsive brand websites.', 4),
('business-automation-ai', 'Business Automation & AI', 'Workflow automation (n8n/Make/Zapier), CRM integration, automated lead processing, and system intelligence leads.', 5)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    display_order = EXCLUDED.display_order;

INSERT INTO public.plans (code, name, price_paise, lead_allocation, billing_period_days, razorpay_plan_id) VALUES
('starter', 'Starter Plan', 49900, 40, 30, 'plan_starter_monthly_499'),
('growth', 'Growth Plan', 99900, 100, 30, 'plan_growth_monthly_999')
ON CONFLICT (code) DO UPDATE SET 
    name = EXCLUDED.name,
    price_paise = EXCLUDED.price_paise,
    lead_allocation = EXCLUDED.lead_allocation,
    billing_period_days = EXCLUDED.billing_period_days;
