import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unlockPreparedRequestBatch } from "@/lib/leads/service";

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
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const result = await unlockPreparedRequestBatch({
      userId: user.id,
      requestId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Unlock batch error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to unlock prepared leads" },
      { status: 400 }
    );
  }
}

