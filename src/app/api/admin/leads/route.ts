import { NextRequest, NextResponse } from "next/server";
import { getLeadsFromDb, insertLeadToDb, updateLeadStatusInDb } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;

    const leads = await getLeadsFromDb({ search, category, status });
    return NextResponse.json({ success: true, leads });
  } catch (err: any) {
    console.error("Fetch leads error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lead = await insertLeadToDb(body);
    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    console.error("Create lead error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create lead" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required." },
        { status: 400 }
      );
    }

    const updated = await updateLeadStatusInDb(id, status);
    return NextResponse.json({ success: true, lead: updated });
  } catch (err: any) {
    console.error("Update lead error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update lead" },
      { status: 500 }
    );
  }
}
