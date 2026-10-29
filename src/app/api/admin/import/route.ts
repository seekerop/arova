import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { parseSpreadsheet, analyzeLeadImport } from "@/lib/leads/import";

export async function POST(req: NextRequest) {
  try {
    const { isAdmin, userId } = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Administrator role required" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name;
    const fileSize = file.size;

    // Check size limit (max 10MB)
    if (fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds maximum permitted size of 10MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const rawRows = parseSpreadsheet(arrayBuffer, fileName);

    if (rawRows.length === 0) {
      return NextResponse.json(
        { error: "Spreadsheet contains no rows or invalid structure" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // Fetch existing leads for deduplication
    const { data: existingLeads } = await supabase
      .from("leads")
      .select("phone, email, website, business_name, city");

    // Run full analysis, category validation, normalization & deduplication
    const analysis = analyzeLeadImport(rawRows, existingLeads || []);

    // Fetch categories map
    const { data: categories } = await supabase
      .from("categories")
      .select("id, name");

    const categoryMap = new Map<string, string>();
    categories?.forEach((c) => categoryMap.set(c.name, c.id));

    // 1. Create Import Batch record
    const { data: batch, error: bErr } = await supabase
      .from("import_batches")
      .insert({
        admin_user_id: userId,
        filename: fileName,
        file_size_bytes: fileSize,
        total_rows: analysis.totalRows,
        valid_rows: analysis.validRows.length,
        invalid_rows: analysis.invalidRows.length,
        duplicate_rows: analysis.duplicateRows.length,
        imported_rows: 0,
        skipped_rows: analysis.invalidRows.length + analysis.duplicateRows.length,
        status: "processing",
        error_summary: {
          invalid: analysis.invalidRows.slice(0, 50),
          duplicates: analysis.duplicateRows.slice(0, 50),
        },
      })
      .select()
      .single();

    if (bErr || !batch) {
      throw new Error(`Failed to initialize import batch: ${bErr?.message}`);
    }

    // 2. Persist Valid Rows
    let importedCount = 0;
    if (analysis.validRows.length > 0) {
      const recordsToInsert = analysis.validRows.map((r) => {
        const catId = categoryMap.get(r.category);
        if (!catId) {
          throw new Error(`Category ${r.category} not found in database.`);
        }
        return {
          business_name: r.business_name,
          contact_name: r.contact_name,
          phone: r.phone,
          email: r.email,
          website: r.website,
          category_id: catId,
          generalized_requirement: r.generalized_requirement,
          estimated_value_paise: r.estimated_value_paise,
          estimated_value_currency: r.estimated_value_currency,
          country: r.country,
          state: r.state,
          city: r.city,
          business_type: r.business_type,
          tags: r.tags,
          source_name: r.source_name,
          source_url: r.source_url,
          data_quality_status: r.data_quality_status,
          availability_status: "available",
          import_batch_id: batch.id,
        };
      });

      // Insert in chunks of 100 for database performance
      for (let i = 0; i < recordsToInsert.length; i += 100) {
        const chunk = recordsToInsert.slice(i, i + 100);
        const { error: insErr } = await supabase.from("leads").insert(chunk);
        if (insErr) {
          console.error("Chunk insert error:", insErr);
        } else {
          importedCount += chunk.length;
        }
      }
    }

    // 3. Update batch status
    await supabase
      .from("import_batches")
      .update({
        imported_rows: importedCount,
        status: "completed",
      })
      .eq("id", batch.id);

    // 4. Audit Log
    await supabase.from("audit_logs").insert({
      actor_id: userId,
      actor_role: "admin",
      action: "lead_import_completed",
      target_entity: "import_batches",
      target_id: batch.id,
      details: {
        filename: fileName,
        total: analysis.totalRows,
        imported: importedCount,
        invalid: analysis.invalidRows.length,
        duplicates: analysis.duplicateRows.length,
      },
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      summary: {
        totalRows: analysis.totalRows,
        importedRows: importedCount,
        invalidRowsCount: analysis.invalidRows.length,
        duplicateRowsCount: analysis.duplicateRows.length,
        invalidSample: analysis.invalidRows.slice(0, 10),
        duplicateSample: analysis.duplicateRows.slice(0, 10),
      },
    });
  } catch (err: any) {
    console.error("Admin import error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process import" },
      { status: 500 }
    );
  }
}
