import { Pool } from "pg";
import { APPROVED_CATEGORIES } from "./constants/categories";

// Global pool instance to prevent connection exhaustion in serverless/dev reload
declare global {
  // eslint-disable-next-line no-var
  var __arova_db_pool: Pool | undefined;
}

export function getDbPool(): Pool {
  if (!global.__arova_db_pool) {
    let connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not configured in environment. Please provide your Supabase connection string: postgresql://postgres.hcyudsqcvfjpytrqtajw:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
      );
    }

    // Auto-fix for Supabase direct IPv4 DNS resolution issue on cloud hosts (e.g. Render):
    // db.[ref].supabase.co lacks IPv4 records. Automatically convert to Supabase transaction pooler on port 6543.
    if (connectionString.includes("db.") && connectionString.includes(".supabase.co")) {
      const match = connectionString.match(
        /postgresql:\/\/([^:]+):([^@]+)@db\.([^.]+)\.supabase\.co(?::\d+)?\/(.+)/
      );
      if (match) {
        const [, user, pass, projectRef, dbName] = match;
        connectionString = `postgresql://${user}.${projectRef}:${pass}@aws-0-ap-south-1.pooler.supabase.com:6543/${dbName}`;
      }
    }

    // Strip sslmode parameter from connection string if present because pg-connection-string
    // overrides ssl.rejectUnauthorized when sslmode is in the query string, causing SELF_SIGNED_CERT_IN_CHAIN.
    connectionString = connectionString
      .replace(/([?&])sslmode=[^&]+(&|$)/g, "$1")
      .replace(/[?&]$/, "");

    const isSupabase =
      connectionString.includes("supabase.co") ||
      connectionString.includes("pooler.supabase.com");

    global.__arova_db_pool = new Pool({
      connectionString,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return global.__arova_db_pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const pool = getDbPool();
  const res = await pool.query(text, params);
  return res.rows as T[];
}

// ==============================================================================
// ADMINISTRATIVE REAL-TIME DATA QUERIES
// ==============================================================================

export async function getAdminOverviewMetrics() {
  const pool = getDbPool();

  // 1. Leads counts
  const leadsCountRes = await pool.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE availability_status = 'available')::int AS available,
      COUNT(*) FILTER (WHERE availability_status = 'reserved')::int AS reserved,
      COUNT(*) FILTER (WHERE availability_status = 'archived')::int AS archived
    FROM leads
  `);
  const leadsCounts = leadsCountRes.rows[0] || { total: 0, available: 0, reserved: 0, archived: 0 };

  // 2. Active claims
  const claimsRes = await pool.query(`
    SELECT COUNT(*)::int AS active_claims FROM lead_claims WHERE status = 'active'
  `);
  const activeClaims = claimsRes.rows[0]?.active_claims || 0;

  // 3. User & subscriber counts
  const usersRes = await pool.query(`
    SELECT
      COUNT(*)::int AS registered_users
    FROM profiles
  `);
  const registeredUsers = usersRes.rows[0]?.registered_users || 0;

  const subsRes = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE s.status = 'active')::int AS active_subs,
      COUNT(*) FILTER (WHERE s.status = 'active' AND pl.code = 'starter')::int AS starter_subs,
      COUNT(*) FILTER (WHERE s.status = 'active' AND pl.code = 'growth')::int AS growth_subs
    FROM subscriptions s
    LEFT JOIN plans pl ON s.plan_id = pl.id
  `);
  const subsCounts = subsRes.rows[0] || { active_subs: 0, starter_subs: 0, growth_subs: 0 };

  // 4. Pending custom lead requests
  const reqsRes = await pool.query(`
    SELECT COUNT(*)::int AS pending FROM lead_requests WHERE status = 'Submitted'
  `);
  const pendingRequests = reqsRes.rows[0]?.pending || 0;

  // 5. Financial collections (captured payments)
  const payRes = await pool.query(`
    SELECT
      COALESCE(SUM(amount_paise), 0)::bigint AS gross_paise
    FROM payments
    WHERE status = 'captured'
  `);
  const grossPaise = Number(payRes.rows[0]?.gross_paise || 0);

  // 6. Quality complaints
  const fbRes = await pool.query(`
    SELECT COUNT(*)::int AS complaints FROM lead_feedback WHERE status = 'pending'
  `);
  const reportedComplaints = fbRes.rows[0]?.complaints || 0;

  // 7. Category breakdown from real categories and leads table
  const catBreakdownRes = await pool.query(`
    SELECT
      c.id,
      c.name,
      c.slug,
      COUNT(l.id)::int AS total,
      COUNT(l.id) FILTER (WHERE l.availability_status = 'available')::int AS available
    FROM categories c
    LEFT JOIN leads l ON l.category_id = c.id
    GROUP BY c.id, c.name, c.slug, c.display_order
    ORDER BY c.display_order ASC
  `);

  return {
    totalLeads: leadsCounts.total,
    availableLeads: leadsCounts.available,
    reservedLeads: leadsCounts.reserved,
    activeClaims,
    archivedLeads: leadsCounts.archived,
    registeredUsers,
    activeSubscribers: subsCounts.active_subs,
    starterSubscribers: subsCounts.starter_subs,
    growthSubscribers: subsCounts.growth_subs,
    pendingRequests,
    collectionsGrossPaise: grossPaise,
    refundsTotalPaise: 0,
    netCollectionsPaise: grossPaise,
    reportedComplaints,
    categoryBreakdown: catBreakdownRes.rows.map((r) => ({
      name: r.name,
      available: r.available,
      total: r.total,
    })),
  };
}

export async function getLeadsFromDb(filters?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  const pool = getDbPool();
  let sql = `
    SELECT
      l.*,
      c.name AS category_name,
      c.slug AS category_slug
    FROM leads l
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (filters?.category && filters.category !== "all") {
    params.push(filters.category);
    sql += ` AND (c.slug = $${params.length} OR c.name = $${params.length})`;
  }

  if (filters?.status && filters.status !== "all") {
    params.push(filters.status);
    sql += ` AND l.availability_status = $${params.length}`;
  }

  if (filters?.search && filters.search.trim()) {
    params.push(`%${filters.search.trim()}%`);
    const p = `$${params.length}`;
    sql += ` AND (l.business_name ILIKE ${p} OR l.contact_name ILIKE ${p} OR l.email ILIKE ${p} OR l.city ILIKE ${p} OR l.generalized_requirement ILIKE ${p})`;
  }

  sql += ` ORDER BY l.created_at DESC`;

  const res = await pool.query(sql, params);
  return res.rows;
}

export async function insertLeadToDb(lead: {
  business_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website?: string;
  category_name: string;
  city: string;
  state?: string;
  country?: string;
  business_type?: string;
  requirement: string;
  estimated_value_paise: number;
  source_name: string;
  availability_status?: string;
}) {
  const pool = getDbPool();

  // Find category ID by name
  const catRes = await pool.query(
    `SELECT id FROM categories WHERE name = $1 OR slug = $1 LIMIT 1`,
    [lead.category_name]
  );
  const categoryId = catRes.rows[0]?.id;
  if (!categoryId) {
    throw new Error(`Category '${lead.category_name}' not found.`);
  }

  const res = await pool.query(
    `
    INSERT INTO leads (
      category_id,
      business_name,
      contact_name,
      phone,
      email,
      website,
      country,
      state,
      city,
      business_type,
      generalized_requirement,
      estimated_value_paise,
      estimated_value_currency,
      source_name,
      collection_date,
      verification_date,
      data_quality_status,
      availability_status
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'INR', $13,
      CURRENT_DATE, CURRENT_DATE, 'verified', $14
    )
    RETURNING *
  `,
    [
      categoryId,
      lead.business_name,
      lead.contact_name,
      lead.phone,
      lead.email,
      lead.website || null,
      lead.country || "India",
      lead.state || null,
      lead.city,
      lead.business_type || null,
      lead.requirement,
      lead.estimated_value_paise || 0,
      lead.source_name,
      lead.availability_status || "available",
    ]
  );

  return res.rows[0];
}

export async function updateLeadStatusInDb(id: string, status: string) {
  const pool = getDbPool();
  const res = await pool.query(
    `UPDATE leads SET availability_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return res.rows[0];
}

export async function getImportBatchesFromDb() {
  const pool = getDbPool();
  const res = await pool.query(`
    SELECT * FROM import_batches ORDER BY created_at DESC
  `);
  return res.rows;
}

export async function getLeadRequestsFromDb(userId?: string) {
  const pool = getDbPool();
  let sql = `
    SELECT
      r.*,
      c.name AS category_name,
      c.slug AS category_slug,
      p.email AS user_email,
      p.company_name AS user_company
    FROM lead_requests r
    LEFT JOIN categories c ON r.category_id = c.id
    LEFT JOIN profiles p ON r.user_id = p.id
  `;
  const params: any[] = [];
  if (userId) {
    params.push(userId);
    sql += ` WHERE r.user_id = $1`;
  }
  sql += ` ORDER BY r.created_at DESC`;

  const res = await pool.query(sql, params);
  return res.rows;
}

export async function getDeliveryRunsFromDb() {
  const pool = getDbPool();
  const res = await pool.query(`
    SELECT * FROM delivery_runs ORDER BY created_at DESC
  `);
  return res.rows;
}

export async function getCustomersFromDb() {
  const pool = getDbPool();
  const res = await pool.query(`
    SELECT
      p.*,
      pl.code AS plan_code,
      s.status AS subscription_status,
      qp.total_allocation,
      qp.consumed_quota,
      qp.reserved_quota,
      (qp.total_allocation - qp.consumed_quota - qp.reserved_quota) AS remaining_quota,
      (SELECT COUNT(*)::int FROM lead_claims lc WHERE lc.user_id = p.id AND lc.status = 'active') AS active_claims_count
    FROM profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status = 'active'
    LEFT JOIN plans pl ON s.plan_id = pl.id
    LEFT JOIN quota_periods qp ON qp.user_id = p.id AND qp.is_active = true
    ORDER BY p.created_at DESC
  `);
  return res.rows;
}

export async function getSubscriptionsFromDb(userId?: string) {
  const pool = getDbPool();
  let sql = `
    SELECT
      s.*,
      p.email AS customer_email,
      p.company_name,
      pl.code AS plan_code,
      pl.name AS plan_name,
      pl.price_paise,
      pl.lead_allocation
    FROM subscriptions s
    LEFT JOIN profiles p ON s.user_id = p.id
    LEFT JOIN plans pl ON s.plan_id = pl.id
  `;
  const params: any[] = [];
  if (userId) {
    params.push(userId);
    sql += ` WHERE s.user_id = $1`;
  }
  sql += ` ORDER BY s.created_at DESC`;

  const res = await pool.query(sql, params);
  return res.rows;
}

export async function getPaymentsFromDb(userId?: string) {
  const pool = getDbPool();
  let sql = `
    SELECT
      pay.*,
      p.email AS customer_email
    FROM payments pay
    LEFT JOIN profiles p ON pay.user_id = p.id
  `;
  const params: any[] = [];
  if (userId) {
    params.push(userId);
    sql += ` WHERE pay.user_id = $1`;
  }
  sql += ` ORDER BY pay.created_at DESC`;

  const res = await pool.query(sql, params);
  return res.rows;
}

export async function getWebhookEventsFromDb() {
  const pool = getDbPool();
  const res = await pool.query(`
    SELECT * FROM payment_webhook_events ORDER BY created_at DESC
  `);
  return res.rows;
}

export async function getLeadFeedbackFromDb(userId?: string) {
  const pool = getDbPool();
  let sql = `
    SELECT
      fb.*,
      l.business_name,
      p.email AS customer_email
    FROM lead_feedback fb
    LEFT JOIN leads l ON fb.lead_id = l.id
    LEFT JOIN profiles p ON fb.user_id = p.id
  `;
  const params: any[] = [];
  if (userId) {
    params.push(userId);
    sql += ` WHERE fb.user_id = $1`;
  }
  sql += ` ORDER BY fb.created_at DESC`;

  const res = await pool.query(sql, params);
  return res.rows;
}

export async function getAuditLogsFromDb() {
  const pool = getDbPool();
  const res = await pool.query(`
    SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100
  `);
  return res.rows;
}

// ==============================================================================
// CUSTOMER-FACING DATA QUERIES (STRICT PRIVACY ENFORCEMENT)
// ==============================================================================

/**
 * Returns user quota and current active pipeline items.
 * CRITICAL PRIVACY RULE:
 * Leads in pending review MUST NOT reveal business_name, contact name, or phone!
 * Only leads with an active exclusive claim in `lead_claims` contain unmasked business information.
 */
export async function getCustomerDashboardData(userId: string) {
  const pool = getDbPool();

  // 1. Quota Period
  const qpRes = await pool.query(
    `SELECT * FROM quota_periods WHERE user_id = $1 AND is_active = true LIMIT 1`,
    [userId]
  );
  const qp = qpRes.rows[0];
  const quota = qp
    ? {
        total: qp.total_allocation,
        consumed: qp.consumed_quota,
        reserved: qp.reserved_quota,
        remaining: qp.total_allocation - qp.consumed_quota - qp.reserved_quota,
      }
    : {
        total: 0,
        consumed: 0,
        reserved: 0,
        remaining: 0,
      };

  // 2. Pending Deliveries (48-hour offer window)
  // CRITICAL: MASK BUSINESS IDENTIFYING DETAILS
  const delRes = await pool.query(
    `
    SELECT
      d.id,
      d.lead_id,
      d.response_deadline,
      d.status,
      d.created_at,
      l.category_id,
      c.name AS category_name,
      l.city,
      l.state,
      l.country,
      l.business_type,
      l.generalized_requirement,
      l.estimated_value_paise,
      l.collection_date
    FROM lead_deliveries d
    JOIN leads l ON d.lead_id = l.id
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE d.user_id = $1 AND d.status = 'pending'
    ORDER BY d.created_at DESC
  `,
    [userId]
  );

  const pendingDeliveries = delRes.rows.map((row) => ({
    id: row.id,
    lead_id: row.lead_id,
    response_deadline: row.response_deadline,
    status: row.status,
    lead: {
      id: row.lead_id,
      // PRIVACY RULE: Do NOT show real business name for unaccepted leads!
      business_name: row.business_type
        ? `Confidential ${row.business_type}`
        : `Commercial Prospect (${row.city || 'Verified'})`,
      category_name: row.category_name,
      city: row.city,
      state: row.state,
      country: row.country,
      business_type: row.business_type,
      generalized_requirement: row.generalized_requirement,
      estimated_value_paise: row.estimated_value_paise,
      collection_date: row.collection_date,
      is_locked: true,
    },
  }));

  // 3. Active Claims (30-day exclusive outreach window)
  // VERIFIED: User has paid & accepted. Full business details unmasked.
  const claimRes = await pool.query(
    `
    SELECT
      lc.id,
      lc.lead_id,
      lc.claimed_at,
      lc.expires_at,
      lc.status,
      l.business_name,
      l.contact_name,
      l.phone,
      l.email,
      l.website,
      l.city,
      l.state,
      l.business_type,
      l.generalized_requirement,
      l.estimated_value_paise,
      c.name AS category_name
    FROM lead_claims lc
    JOIN leads l ON lc.lead_id = l.id
    LEFT JOIN categories c ON l.category_id = c.id
    WHERE lc.user_id = $1 AND lc.status = 'active'
    ORDER BY lc.claimed_at DESC
  `,
    [userId]
  );

  const activeClaims = claimRes.rows.map((row) => ({
    id: row.id,
    lead_id: row.lead_id,
    claimed_at: row.claimed_at,
    expires_at: row.expires_at,
    status: row.status,
    lead: {
      id: row.lead_id,
      business_name: row.business_name,
      contact_name: row.contact_name,
      phone: row.phone,
      email: row.email,
      website: row.website,
      category_name: row.category_name,
      city: row.city,
      state: row.state,
      business_type: row.business_type,
      generalized_requirement: row.generalized_requirement,
      estimated_value_paise: row.estimated_value_paise,
      is_locked: false,
    },
  }));

  return {
    quota,
    pendingDeliveries,
    activeClaims,
  };
}

export async function getCustomerLeadsList(userId: string) {
  const pool = getDbPool();

  // Combine user's deliveries and claims
  const res = await pool.query(
    `
    SELECT
      d.id AS delivery_id,
      d.lead_id,
      d.status AS delivery_status,
      d.created_at AS delivered_at,
      d.response_deadline,
      lc.id AS claim_id,
      lc.status AS claim_status,
      lc.claimed_at,
      lc.expires_at AS claim_expires_at,
      l.business_name,
      l.contact_name,
      l.phone,
      l.email,
      l.website,
      l.city,
      l.state,
      l.country,
      l.business_type,
      l.generalized_requirement,
      l.estimated_value_paise,
      c.name AS category_name
    FROM lead_deliveries d
    JOIN leads l ON d.lead_id = l.id
    LEFT JOIN categories c ON l.category_id = c.id
    LEFT JOIN lead_claims lc ON lc.lead_id = d.lead_id AND lc.user_id = d.user_id AND lc.status = 'active'
    WHERE d.user_id = $1
    ORDER BY d.created_at DESC
  `,
    [userId]
  );

  return res.rows.map((row) => {
    const isClaimed = row.claim_status === "active";
    return {
      id: row.delivery_id,
      leadId: row.lead_id,
      // CRITICAL PRIVACY CHECK:
      // NEVER show business_name if NOT claimed!
      business_name: isClaimed
        ? row.business_name
        : row.business_type
        ? `Confidential ${row.business_type}`
        : `Commercial Prospect (${row.city || 'Verified'})`,
      contact_name: isClaimed ? row.contact_name : "Hidden until accepted",
      phone: isClaimed ? row.phone : "•••• ••••••",
      email: isClaimed ? row.email : "•••••@••••.in",
      website: isClaimed ? row.website : null,
      category: row.category_name,
      city: row.city,
      state: row.state,
      country: row.country,
      requirement: row.generalized_requirement,
      delivered_at: row.delivered_at,
      response_deadline: row.response_deadline,
      claim_expires_at: row.claim_expires_at,
      status: isClaimed ? "active" : row.delivery_status,
      is_locked: !isClaimed,
    };
  });
}

// ==============================================================================
// USER PROFILE & SUBSCRIPTION MANAGEMENT
// ==============================================================================

export async function getUserProfile(userId: string) {
  const pool = getDbPool();
  const res = await pool.query(
    `
    SELECT 
      p.id,
      p.email,
      p.full_name,
      p.company,
      p.phone,
      p.created_at,
      p.updated_at,
      s.status AS subscription_status,
      s.current_period_start,
      s.current_period_end,
      pl.code AS plan_code,
      pl.name AS plan_name,
      pl.price_paise,
      pl.lead_allocation
    FROM profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id AND s.status = 'active'
    LEFT JOIN plans pl ON s.plan_id = pl.id
    WHERE p.id = $1
    LIMIT 1
  `,
    [userId]
  );
  return res.rows[0] || null;
}

export async function upsertUserProfile(params: {
  id: string;
  email: string;
  full_name?: string | null;
  company?: string | null;
  phone?: string | null;
}) {
  const pool = getDbPool();
  const res = await pool.query(
    `
    INSERT INTO profiles (id, email, full_name, company, phone, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
      company = COALESCE(EXCLUDED.company, profiles.company),
      phone = COALESCE(EXCLUDED.phone, profiles.phone),
      updated_at = NOW()
    RETURNING *
  `,
    [
      params.id,
      params.email,
      params.full_name ?? null,
      params.company ?? null,
      params.phone ?? null,
    ]
  );
  return res.rows[0];
}

export async function updateUserProfile(
  userId: string,
  params: {
    full_name?: string;
    company?: string;
    phone?: string;
  }
) {
  const pool = getDbPool();
  const res = await pool.query(
    `
    UPDATE profiles
    SET
      full_name = COALESCE($2, full_name),
      company = COALESCE($3, company),
      phone = COALESCE($4, phone),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
    [userId, params.full_name, params.company, params.phone]
  );
  return res.rows[0];
}

