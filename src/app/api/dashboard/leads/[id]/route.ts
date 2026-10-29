import { NextRequest, NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    let userId = "00000000-0000-0000-0000-000000000000";
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Guest
    }

    const pool = getDbPool();

    // Check if the user holds an active claim on this lead
    const claimRes = await pool.query(
      `SELECT * FROM lead_claims WHERE lead_id = $1 AND user_id = $2 AND status = 'active' LIMIT 1`,
      [leadId, userId]
    );
    const hasClaim = claimRes.rows.length > 0;
    const claim = claimRes.rows[0] || null;

    // Check if the user has an active delivery offer on this lead
    const delRes = await pool.query(
      `SELECT * FROM lead_deliveries WHERE lead_id = $1 AND user_id = $2 AND status = 'pending' LIMIT 1`,
      [leadId, userId]
    );
    const delivery = delRes.rows[0] || null;

    // Fetch the lead record
    const leadRes = await pool.query(
      `SELECT l.*, c.name AS category_name FROM leads l LEFT JOIN categories c ON l.category_id = c.id WHERE l.id = $1 LIMIT 1`,
      [leadId]
    );

    if (leadRes.rows.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leadRes.rows[0];

    // CRITICAL PRIVACY RULE:
    // If user has NOT claimed this lead, strictly mask the business name, contact name, phone, email, and website!
    if (!hasClaim) {
      return NextResponse.json({
        success: true,
        isClaimed: false,
        deliveryId: delivery?.id || null,
        response_deadline: delivery?.response_deadline || null,
        lead: {
          id: lead.id,
          // MASKED:
          business_name: `Confidential ${lead.business_type || lead.category_name || 'Prospect'}`,
          category_name: lead.category_name,
          city: lead.city,
          state: lead.state,
          country: lead.country,
          business_type: lead.business_type,
          generalized_requirement: lead.generalized_requirement,
          estimated_value_paise: lead.estimated_value_paise,
          estimated_value_inr: lead.estimated_value_paise
            ? `₹${(lead.estimated_value_paise / 100).toLocaleString("en-IN")}`
            : "₹2,50,000",
          collection_date: lead.collection_date,
          verification_date: lead.verification_date,
          is_locked: true,
        },
      });
    }

    // Unmasked for active claim
    return NextResponse.json({
      success: true,
      isClaimed: true,
      claimId: claim.id,
      claimed_at: claim.claimed_at,
      expires_at: claim.expires_at,
      deliveryId: delivery?.id || null,
      lead: {
        id: lead.id,
        business_name: lead.business_name,
        contact_name: lead.contact_name,
        phone: lead.phone,
        email: lead.email,
        website: lead.website,
        category_name: lead.category_name,
        city: lead.city,
        state: lead.state,
        country: lead.country,
        business_type: lead.business_type,
        generalized_requirement: lead.generalized_requirement,
        estimated_value_paise: lead.estimated_value_paise,
        estimated_value_inr: lead.estimated_value_paise
          ? `₹${(lead.estimated_value_paise / 100).toLocaleString("en-IN")}`
          : "₹2,50,000",
        source_name: lead.source_name,
        source_url: lead.source_url,
        collection_date: lead.collection_date,
        verification_date: lead.verification_date,
        is_locked: false,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
