# AROVA — PRODUCTION DEPLOYMENT & OPERATIONS GUIDE

## 1. Overview
Arova is a production-ready subscription-based business lead platform under the **Arenova** brand ecosystem (Cinematic Obsidian × Ember × Intelligence).

---

## 2. Environment Variables Specification

Ensure all required environment variables are configured in `.env.local` (for development) or in your hosting provider's secrets manager (Vercel, Railway, AWS):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay Subscriptions & Verification (Indian Rupee / INR)
RAZORPAY_KEY_ID=rzp_live_yourkeyid
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_signing_secret

# Razorpay Subscriptions Plan IDs (Created in Razorpay Dashboard)
RAZORPAY_STARTER_PLAN_ID=plan_starter_monthly_499
RAZORPAY_GROWTH_PLAN_ID=plan_growth_monthly_999

# Base URL & Scheduled Worker Authorization
APP_BASE_URL=https://arova.io
CRON_SECRET=super_secret_cron_bearer_token_here
```

---

## 3. Supabase Database Migration & Seeding

1. Connect to your Supabase project using the Supabase CLI or SQL Editor:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```
2. Or execute the migration script located at:
   `supabase/migrations/20261030000000_arova_schema.sql`
3. This creates all 21 normalized entities, RLS policies, check constraints, and automatically seeds:
   - **5 Approved Categories:**
     1. Programming & Software
     2. Video Editing & Production
     3. Digital Marketing & SEO
     4. Website & E-commerce
     5. Business Automation & AI
   - **2 Subscription Plans:**
     - Starter: ₹499 (49,900 paise), 40 leads / 30 days
     - Growth: ₹999 (99,900 paise), 100 leads / 30 days

---

## 4. Secure First-Admin Bootstrap

In accordance with our strict security principles, there is no public self-elevation registration flow for administrators. To grant the first administrator role:

1. Register an account through `/signup`.
2. Locate the user UUID in Supabase Auth (`auth.users`).
3. Execute the following SQL statement in the Supabase SQL Editor:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('YOUR_USER_UUID_HERE', 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
   ```
4. Log into `/admin` to access the privileged administrative dashboard.

---

## 5. Razorpay Configuration

### Plans Setup
In the Razorpay Dashboard (Dashboard -> Subscriptions -> Plans):
1. **Starter Plan:**
   - Period: Monthly (Every 1 Month)
   - Amount: ₹499
   - Note Plan ID -> set as `RAZORPAY_STARTER_PLAN_ID`
2. **Growth Plan:**
   - Period: Monthly (Every 1 Month)
   - Amount: ₹999
   - Note Plan ID -> set as `RAZORPAY_GROWTH_PLAN_ID`

### Webhook Configuration
In the Razorpay Dashboard (Settings -> Webhooks):
1. Add Endpoint: `https://arova.io/api/webhooks/razorpay`
2. Secret: Specify a strong random string and copy to `RAZORPAY_WEBHOOK_SECRET`.
3. Active Events:
   - `subscription.authenticated`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.halted`
   - `payment.captured`
   - `payment.failed`

---

## 6. Durable Scheduled Jobs & Automation

The platform automates:
1. **48-Hour Offer Expiry:** Releases reservations and restores remaining quota if an offered lead is not accepted within 48 hours.
2. **30-Day Exclusive Claim Expiry:** Archives or moves claims into review after 30 days of exclusive outreach.
3. **Paced Lead Distribution:** Distributes matching available leads to active subscribers with remaining quota.

### Setting up Cron Trigger
Invoke the worker endpoint via Supabase pg_cron, Vercel Cron, or GitHub Actions every 15 minutes:
```bash
curl -X POST https://arova.io/api/cron/process \
  -H "Authorization: Bearer <CRON_SECRET>"
```

---

## 7. Troubleshooting

- **Signature Verification Failed:** Ensure `RAZORPAY_WEBHOOK_SECRET` matches the exact string configured in the Razorpay Webhooks tab. Next.js App Router reads the raw body text (`req.text()`) to verify HMAC SHA256 timing-safe hashes.
- **Quota Exceeded Error:** Quota engine invariants are strictly database-enforced: `remaining = total - consumed - reserved`. Ensure subscribers have sufficient remaining balance before batch unlocking.
- **Privacy Masking:** Contact fields are strictly masked server-side until explicit offer acceptance or claim.
