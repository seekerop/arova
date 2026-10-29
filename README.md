# AROVA — Master Product, Design & Engineering System

**Production-ready subscription-based business lead platform under the Arenova brand ecosystem.**

---

## 1. Executive Summary & Brand Identity

Arova is a disciplined business lead intelligence platform built for freelancers, agencies, and service studios. Sourced through deterministic manual curation and verified business registries across India, Arova connects service providers with prospective commercial clients across exactly **five flat approved categories**.

### The Arenova Visual Identity: *Obsidian × Ember × Intelligence*
Arova adheres strictly to Arenova's design philosophy:
- **Deep Obsidian (`#080505`):** Ultra-dark, refined application canvas.
- **Charcoal Base (`#111110`):** Structured surfaces, sidebars, and navigation.
- **Elevated Surfaces (`#161514`):** Modals, cards, and data menus.
- **Flame Orange (`#E84B2C`):** Primary brand accent and crucial calls to action.
- **Radiant Amber (`#FFAA3D`) & Burnished Copper (`#C86938`):** Selective highlights and restrained warm lighting.
- **Editorial Gold (`#D4AF37`):** VIP / Pro highlights.
- **Success Green (`#34D399`):** Exclusively for active states and confirmed operations.
- **Typography:** Display headings in **Syne**, body and interface in **Plus Jakarta Sans**, selective editorial brand accents in **Cinzel**, and technical IDs/metadata in **JetBrains Mono**.

---

## 2. Strict Operating Principles

1. **No AI Generation or Hallucinations:** No Gemini, OpenAI, or synthetic text generation integrations. Sourced leads are genuine business records.
2. **Manual Sourcing & Spreadsheet Imports:** Leads enter through admin CSV/XLSX batch uploads with automatic normalization and deduplication.
3. **Deterministic Quota Accounting:**
   $$\text{remaining\_quota} = \text{total\_allocation} - \text{consumed\_quota} - \text{reserved\_quota}$$
4. **48-Hour Review Window:** Customers have 48 hours to inspect safe preview requirements and accept or decline.
5. **30-Day Exclusive Claim:** Accepted leads remain locked exclusively to the customer for 30 days. No internal reselling or duplicate distribution.
6. **Privacy-Protected Previews:** Direct phone, email, and website profiles remain masked at the server level until authorized offer acceptance.
7. **Real Razorpay Verification:** Subscriptions and webhook signatures (HMAC SHA256) are verified server-side with idempotency guards.
8. **Pre-Subscription Requests:** Prospective customers can request 1–9 customized preview leads before subscribing.

---

## 3. Approved Categories (Strictly Flat — Zero Subcategories)

The product enforces exactly five commercial domains:
1. **Programming & Software:** Web applications, APIs, backend architectures, mobile development.
2. **Video Editing & Production:** Post-production, motion graphics, YouTube commercial editing.
3. **Digital Marketing & SEO:** Search engine optimization, Google Ads, Meta advertising, conversion optimization.
4. **Website & E-commerce:** Shopify builds, WooCommerce stores, high-converting landing pages.
5. **Business Automation & AI:** Workflow automation (n8n/Make/Zapier), CRM integration, automated pipeline routing.

*Subcategories, nested hierarchies, and secondary trees are strictly prohibited.*

---

## 4. Subscription Plans

| Plan | Price (INR / Paise) | Allocation | Billing Period | Exclusivity |
|---|---|---|---|---|
| **Starter** | ₹499 (49,900 paise) | 40 leads | 30 days | 30 Days Exclusive |
| **Growth** | ₹999 (99,900 paise) | 100 leads | 30 days | 30 Days Exclusive |

Internal accounting operates in integer **paise** to prevent floating-point rounding issues.

---

## 5. Technology Stack

- **Framework:** Next.js (App Router with Turbopack)
- **Frontend:** React, Tailwind CSS v4, Lucide Icons
- **Persistence & Auth:** Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Payments:** Razorpay Subscriptions & Webhook HMAC Verification
- **Testing:** Vitest automated test suite
- **Spreadsheet Parsing:** PapaParse (CSV) & SheetJS (XLSX)

---

## 6. Directory Structure

```
arova/
├── src/
│   ├── app/
│   │   ├── (public)
│   │   │   ├── page.tsx                  # Cinematic Obsidian & Ember Hero
│   │   │   ├── pricing/page.tsx          # Plans, feature matrix & disclaimer check
│   │   │   ├── how-it-works/page.tsx     # 5-step workflow explanation
│   │   │   ├── categories/page.tsx       # 5 approved flat categories showcase
│   │   │   ├── faq/page.tsx              # Comprehensive platform questions
│   │   │   ├── terms/page.tsx            # Terms of service
│   │   │   ├── privacy/page.tsx          # Commercial privacy policy
│   │   │   ├── refund-policy/page.tsx    # Data accuracy replacement rules
│   │   │   └── contact/page.tsx          # Direct support inquiry form
│   │   ├── (auth)
│   │   │   ├── login/page.tsx            # Authenticated login
│   │   │   ├── signup/page.tsx           # Account registration & disclaimer log
│   │   │   ├── forgot-password/page.tsx  # Password reset dispatch
│   │   │   └── reset-password/page.tsx   # Password update
│   │   ├── dashboard/                    # Customer Dashboard
│   │   │   ├── page.tsx                  # Quota overview & pending offers
│   │   │   ├── leads/page.tsx            # My Leads table with filters
│   │   │   ├── leads/[id]/page.tsx       # Safe preview & full contact disclosure
│   │   │   ├── requests/page.tsx         # Pre-subscription requests (1-9 leads)
│   │   │   ├── subscription/page.tsx     # Plan management & Razorpay upgrade
│   │   │   ├── billing/page.tsx          # Invoices & captured transactions
│   │   │   ├── preferences/page.tsx      # Target category & cities
│   │   │   ├── settings/page.tsx         # Profile & security credentials
│   │   │   └── notifications/page.tsx    # In-app alerts
│   │   ├── admin/                        # Administrative Portal
│   │   │   ├── page.tsx                  # Platform metrics & manual engine trigger
│   │   │   ├── leads/page.tsx            # Inventory search, add, edit, archive
│   │   │   ├── imports/page.tsx          # CSV/XLSX parser & deduplication
│   │   │   ├── requests/page.tsx         # Pre-sub batch review & assignment
│   │   │   ├── deliveries/page.tsx       # Delivery runs monitoring & worker log
│   │   │   ├── customers/page.tsx        # Customer inspection & suspension
│   │   │   ├── subscriptions/page.tsx    # Active subscriptions & cancellations
│   │   │   ├── payments/page.tsx         # Captured payments & webhook events
│   │   │   ├── feedback/page.tsx         # Data accuracy complaints & replacement
│   │   │   ├── analytics/page.tsx        # Category stock & claim ratios
│   │   │   ├── audit-logs/page.tsx       # Security & administrative audit trail
│   │   │   └── settings/page.tsx         # First-admin bootstrap instructions
│   │   └── api/
│   │       ├── webhooks/razorpay/        # Webhook signature verification
│   │       ├── payments/create-sub/      # Server-side subscription creation
│   │       ├── payments/verify/          # Authoritative payment verification
│   │       ├── cron/process/             # Bearer-token scheduled worker
│   │       ├── leads/accept/             # Offer acceptance & 30d claim
│   │       ├── leads/reject/             # Offer decline & quota release
│   │       ├── leads/unlock-batch/       # Prepared batch unlock (charge once)
│   │       ├── admin/import/             # Spreadsheet analysis & persistence
│   │       ├── admin/cron-trigger/       # Manual admin cron execution
│   │       └── feedback/                 # Report inaccurate lead data
│   ├── components/
│   │   ├── ui/                           # Arenova-themed buttons, inputs, dialogs
│   │   └── navigation/                   # Public and dashboard headers/sidebars
│   ├── lib/
│   │   ├── constants/                    # Categories, plans, and tokens
│   │   ├── quota/                        # Mathematical quota accounting engine
│   │   ├── leads/                        # Lead queries, privacy masking, import
│   │   ├── razorpay/                     # Razorpay client & webhook verifier
│   │   └── supabase/                     # SSR client and server utilities
├── supabase/
│   └── migrations/
│       └── 20261030000000_arova_schema.sql # Complete 21-table schema + RLS
├── tests/
│   └── unit/                             # Automated test suite (Vitest)
└── DEPLOYMENT.md                         # Production deployment guide
```

---

## 7. Mandatory Lead Limitation Disclosure

Every purchase, dashboard screen, and public pricing view clearly displays the mandatory disclaimer:

> **“Arova provides potential business leads, not guaranteed business opportunities. Leads are not guaranteed to respond, convert, or generate revenue. You are responsible for contacting each business, pitching your services, following up, negotiating, and converting prospects into customers.”**

---

## 8. Local Setup & Testing

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run tests:**
   ```bash
   npm run test
   ```
3. **Execute production build:**
   ```bash
   npm run build
   ```
4. **Launch development server:**
   ```bash
   npm run dev
   ```

---

## 9. First Administrator Provisioning

To prevent unauthorized privilege elevation, no public admin registration endpoint exists. To designate the first administrator, run the following SQL command in your Supabase project:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

