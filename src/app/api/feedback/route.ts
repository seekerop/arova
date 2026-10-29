import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leadId, issueType, description } = body;

    if (!leadId || !issueType || !description) {
      return NextResponse.json(
        { error: "Lead ID, issue type, and description are required" },
        { status: 400 }
      );
    }

    const adminClient = createSupabaseAdminClient();

    // Verify user has an active or accepted claim on this lead
    const { data: claim } = await adminClient
      .from("lead_claims")
      .select("id")
      .eq("lead_id", leadId)
      .eq("user_id", user.id)
      .single();

    if (!claim) {
      return NextResponse.json(
        { error: "You can only report feedback on leads you have claimed." },
        { status: 403 }
      );
    }

    const { data: feedback, error } = await adminClient
      .from("lead_feedback")
      .insert({
        user_id: user.id,
        lead_id: leadId,
        issue_type: issueType,
        description: description.trim(),
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, feedback });
  } catch (err: any) {
    console.error("Feedback error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
