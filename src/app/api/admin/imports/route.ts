import { NextResponse } from "next/server";
import { getImportBatchesFromDb } from "@/lib/db";
import { verifyAdminSession } from "@/lib/security/roles";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batches = await getImportBatchesFromDb();
    return NextResponse.json({ success: true, batches });
  } catch (err: any) {
    console.error("Fetch batches error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch import batches" },
      { status: 500 }
    );
  }
}
