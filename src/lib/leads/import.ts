import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeCategoryName, isApprovedCategory, ApprovedCategoryName } from "@/lib/constants/categories";

export interface RawLeadRow {
  business_name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  category?: string;
  generalized_requirement?: string;
  estimated_value?: string | number;
  country?: string;
  state?: string;
  city?: string;
  business_type?: string;
  tags?: string;
  source_name?: string;
  source_url?: string;
  [key: string]: unknown;
}

export interface ValidatedLeadRow {
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  category: ApprovedCategoryName;
  generalized_requirement: string;
  estimated_value_paise: number | null;
  estimated_value_currency: string;
  country: string;
  state: string | null;
  city: string;
  business_type: string | null;
  tags: string[];
  source_name: string;
  source_url: string | null;
  data_quality_status: 'verified' | 'unverified';
}

export interface ImportErrorRow {
  rowNumber: number;
  raw: RawLeadRow;
  reasons: string[];
}

export interface ImportDuplicateRow {
  rowNumber: number;
  raw: RawLeadRow;
  matchType: 'phone' | 'email' | 'website' | 'business_city';
  matchedValue: string;
}

export interface ImportAnalysisResult {
  totalRows: number;
  validRows: ValidatedLeadRow[];
  invalidRows: ImportErrorRow[];
  duplicateRows: ImportDuplicateRow[];
}

/**
 * Normalizes phone numbers: removes spaces, dashes, parentheses.
 * Ensures consistent Indian or international digits.
 */
export function normalizePhone(rawPhone: string | null | undefined): string | null {
  if (!rawPhone) return null;
  const cleaned = rawPhone.replace(/[^\d+]/g, "").trim();
  if (cleaned.length < 7) return null;
  return cleaned;
}

/**
 * Normalizes email: trims and lowercases.
 */
export function normalizeEmail(rawEmail: string | null | undefined): string | null {
  if (!rawEmail) return null;
  const cleaned = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) return null;
  return cleaned;
}

/**
 * Normalizes website URL: removes trailing slashes and protocols for clean deduplication.
 */
export function normalizeUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  let cleaned = rawUrl.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, "").replace(/^www\./, "");
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned.length > 3 ? cleaned : null;
}

/**
 * Parses a CSV or XLSX Buffer / text content into an array of RawLeadRow objects.
 */
export function parseSpreadsheet(
  buffer: ArrayBuffer | Uint8Array,
  fileName: string
): RawLeadRow[] {
  const isXlsx = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

  if (isXlsx) {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json<RawLeadRow>(worksheet, { defval: "" });
  }

  // Parse CSV
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(buffer);
  const result = Papa.parse<RawLeadRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) =>
      header
        .trim()
        .toLowerCase()
        .replace(/[\s\-_]+/g, "_"),
  });

  return result.data;
}

/**
 * Validates, normalizes, and deduplicates an imported batch of raw rows.
 * Existing leads in database can be passed to check against existing inventory.
 */
export function analyzeLeadImport(
  rawRows: RawLeadRow[],
  existingLeads: Array<{
    phone: string | null;
    email: string | null;
    website: string | null;
    business_name: string;
    city: string;
  }> = []
): ImportAnalysisResult {
  const validRows: ValidatedLeadRow[] = [];
  const invalidRows: ImportErrorRow[] = [];
  const duplicateRows: ImportDuplicateRow[] = [];

  // Sets for in-batch deduplication
  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();
  const seenWebsites = new Set<string>();
  const seenBusinessCity = new Set<string>();

  // Populate from existing database leads
  existingLeads.forEach((lead) => {
    if (lead.phone) {
      const p = normalizePhone(lead.phone);
      if (p) seenPhones.add(p);
    }
    if (lead.email) {
      const e = normalizeEmail(lead.email);
      if (e) seenEmails.add(e);
    }
    if (lead.website) {
      const w = normalizeUrl(lead.website);
      if (w) seenWebsites.add(w);
    }
    if (lead.business_name && lead.city) {
      seenBusinessCity.add(
        `${lead.business_name.trim().toLowerCase()}__${lead.city.trim().toLowerCase()}`
      );
    }
  });

  rawRows.forEach((row, index) => {
    const rowNumber = index + 2; // 1-indexed, accounting for header
    const reasons: string[] = [];

    // 1. Business Name
    const businessName = (row.business_name || "").toString().trim();
    if (!businessName) {
      reasons.push("Business name is required.");
    }

    // 2. Category validation (Strict 5 categories)
    const rawCategory = (row.category || "").toString().trim();
    const normalizedCategory = normalizeCategoryName(rawCategory);
    if (!normalizedCategory || !isApprovedCategory(normalizedCategory)) {
      reasons.push(
        `Invalid category "${rawCategory}". Must be one of the 5 approved categories.`
      );
    }

    // 3. City
    const city = (row.city || "").toString().trim();
    if (!city) {
      reasons.push("City is required.");
    }

    // 4. Contact Details (At least one must be provided for a business lead)
    const normPhone = normalizePhone(row.phone ? row.phone.toString() : null);
    const normEmail = normalizeEmail(row.email ? row.email.toString() : null);
    const normWebsite = normalizeUrl(row.website ? row.website.toString() : null);

    if (!normPhone && !normEmail && !normWebsite) {
      reasons.push("At least one contact point (phone, email, or website) is required.");
    }

    if (reasons.length > 0) {
      invalidRows.push({ rowNumber, raw: row, reasons });
      return;
    }

    // Deduplication check
    const businessCityKey = `${businessName.toLowerCase()}__${city.toLowerCase()}`;

    if (normPhone && seenPhones.has(normPhone)) {
      duplicateRows.push({
        rowNumber,
        raw: row,
        matchType: "phone",
        matchedValue: normPhone,
      });
      return;
    }

    if (normEmail && seenEmails.has(normEmail)) {
      duplicateRows.push({
        rowNumber,
        raw: row,
        matchType: "email",
        matchedValue: normEmail,
      });
      return;
    }

    if (normWebsite && seenWebsites.has(normWebsite)) {
      duplicateRows.push({
        rowNumber,
        raw: row,
        matchType: "website",
        matchedValue: normWebsite,
      });
      return;
    }

    if (seenBusinessCity.has(businessCityKey)) {
      duplicateRows.push({
        rowNumber,
        raw: row,
        matchType: "business_city",
        matchedValue: `${businessName} in ${city}`,
      });
      return;
    }

    // Mark as seen for subsequent rows in this batch
    if (normPhone) seenPhones.add(normPhone);
    if (normEmail) seenEmails.add(normEmail);
    if (normWebsite) seenWebsites.add(normWebsite);
    seenBusinessCity.add(businessCityKey);

    // Tags extraction
    const rawTags = (row.tags || "").toString().trim();
    const tags = rawTags
      ? rawTags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    // Parse Estimated value into Paise
    let estimatedValuePaise: number | null = null;
    if (row.estimated_value) {
      const num = parseFloat(
        row.estimated_value.toString().replace(/[^\d.]/g, "")
      );
      if (!isNaN(num) && num > 0) {
        estimatedValuePaise = Math.round(num * 100);
      }
    }

    validRows.push({
      business_name: businessName,
      contact_name: (row.contact_name || "").toString().trim() || null,
      phone: normPhone,
      email: normEmail,
      website: normWebsite ? `https://${normWebsite}` : null,
      category: normalizedCategory!,
      generalized_requirement:
        (row.generalized_requirement || "").toString().trim() ||
        `Prospective business client seeking ${normalizedCategory} solutions.`,
      estimated_value_paise: estimatedValuePaise,
      estimated_value_currency: "INR",
      country: (row.country || "India").toString().trim(),
      state: (row.state || "").toString().trim() || null,
      city,
      business_type: (row.business_type || "").toString().trim() || "Business",
      tags,
      source_name: (row.source_name || "Direct Business Registry").toString().trim(),
      source_url: (row.source_url || "").toString().trim() || null,
      data_quality_status: normPhone || normEmail ? "verified" : "unverified",
    });
  });

  return {
    totalRows: rawRows.length,
    validRows,
    invalidRows,
    duplicateRows,
  };
}

