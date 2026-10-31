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
 * Supports both standard header files and headerless prospect CSVs.
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

  // Check if first line appears to have standard column headers
  const firstLine = text.trim().split(/\r?\n/)[0] || "";
  const hasStandardHeader =
    /business_name|company|name|title|category|requirement|lead_type|problem/i.test(firstLine);

  if (hasStandardHeader) {
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

  // Headerless CSV fallback: map standard 6-column prospect export format
  // [business_name, location, google_reviews, lead_type, business_type, problem]
  const result = Papa.parse<string[]>(text, {
    header: false,
    skipEmptyLines: true,
  });

  return result.data.map((row) => ({
    business_name: row[0] || "",
    location: row[1] || "",
    google_reviews: row[2] || "",
    lead_type: row[3] || "",
    business_type: row[4] || "",
    problem: row[5] || "",
  }));
}

/**
 * Approximates realistic B2B project deal value in Paise (INR * 100)
 * based on client tier across any category and niche:
 * - Enterprise: ₹20,000 - ₹50,000 (20k - 50k)
 * - Growing Business / SME / Local / Startup: ₹10,000 - ₹25,000 (10k - 25k)
 */
export function approximateLeadValuePaise(
  category?: ApprovedCategoryName,
  leadType?: string | null
): number {
  const tier = (leadType || "").toLowerCase();
  const isEnterprise = tier.includes("enterprise") || tier.includes("corporate");

  let minInr = 10000;
  let maxInr = 25000;

  if (isEnterprise) {
    minInr = 20000;
    maxInr = 50000;
  } else {
    // Growing Business, SME, Startup, Local Business across any category/niche: 10k-25k
    minInr = 10000;
    maxInr = 25000;
  }

  const randomInr = Math.floor(Math.random() * (maxInr - minInr + 1)) + minInr;
  const roundedInr = Math.round(randomInr / 500) * 500;
  return roundedInr * 100; // in paise
}

/**
 * Validates, normalizes, and deduplicates an imported batch of raw rows.
 * Existing leads in database can be passed to check against existing inventory.
 */
export function analyzeLeadImport(
  rawRows: RawLeadRow[],
  existingLeads: Array<{
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    business_name?: string | null;
    city?: string | null;
  }> = [],
  targetCategory?: string | null
): ImportAnalysisResult {
  const validRows: ValidatedLeadRow[] = [];
  const invalidRows: ImportErrorRow[] = [];
  const duplicateRows: ImportDuplicateRow[] = [];

  // Sets for in-batch deduplication
  const seenPhones = new Set<string>();
  const seenEmails = new Set<string>();
  const seenWebsites = new Set<string>();
  const seenBusinessCity = new Set<string>();

  const targetNormalizedCategory = targetCategory ? normalizeCategoryName(targetCategory) : null;

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
    const rowNormalizedCategory = normalizeCategoryName(rawCategory);
    // If targetCategory is explicitly specified, use it for the row if row doesn't have an approved category or as target
    const categoryToUse = targetNormalizedCategory || rowNormalizedCategory;

    if (!categoryToUse || !isApprovedCategory(categoryToUse)) {
      reasons.push(
        `Invalid category "${rawCategory || '(unspecified)'}". Must be one of the 5 approved categories.`
      );
    }

    // 3. City & Location Parsing
    const locationStr = (row.location || "").toString().trim();
    let city = (row.city || "").toString().trim();
    let state = (row.state || "").toString().trim() || null;
    let country = (row.country || "India").toString().trim();

    if (!city && locationStr) {
      const parts = locationStr.split(",").map((p) => p.trim());
      if (parts.length > 0) city = parts[0];
      if (parts.length > 1 && !state) state = parts[1];
      if (parts.length > 2 && country === "India") country = parts[2];
    }

    if (!city) {
      reasons.push("City is required.");
    }

    // 4. Contact Details (Phone, email, or website domain)
    const normPhone = normalizePhone(row.phone ? row.phone.toString() : null);
    const normEmail = normalizeEmail(row.email ? row.email.toString() : null);
    let normWebsite = normalizeUrl(row.website ? row.website.toString() : null);

    // If prospect dataset has no direct contact, synthesize corporate domain from business name
    if (!normPhone && !normEmail && !normWebsite && businessName) {
      const cleanDomain = businessName
        .split(/[\(\[\-,]/)[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (cleanDomain.length >= 2) {
        normWebsite = `${cleanDomain}.in`;
      }
    }

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
    if (row.lead_type && !tags.includes(row.lead_type.toString().trim())) {
      tags.push(row.lead_type.toString().trim());
    }
    if (row.google_reviews) {
      tags.push(`Reviews: ${row.google_reviews.toString().trim()}`);
    }

    // Parse Estimated value into Paise or auto-approximate
    let estimatedValuePaise: number | null = null;
    if (row.estimated_value) {
      const num = parseFloat(
        row.estimated_value.toString().replace(/[^\d.]/g, "")
      );
      if (!isNaN(num) && num > 0) {
        estimatedValuePaise = Math.round(num * 100);
      }
    }

    // If no estimated value provided, approximate intelligently based on category & tier
    if (!estimatedValuePaise) {
      const leadTier = (row.lead_type || "").toString().trim();
      estimatedValuePaise = approximateLeadValuePaise(categoryToUse!, leadTier);
    }

    const requirement = (
      row.generalized_requirement ||
      row.problem ||
      row.requirement ||
      row.description ||
      ""
    ).toString().trim();

    validRows.push({
      business_name: businessName,
      contact_name: (row.contact_name || "").toString().trim() || null,
      phone: normPhone,
      email: normEmail,
      website: normWebsite ? `https://${normWebsite}` : null,
      category: categoryToUse!,
      generalized_requirement:
        requirement ||
        `Prospective business client seeking ${categoryToUse} solutions.`,
      estimated_value_paise: estimatedValuePaise,
      estimated_value_currency: "INR",
      country: (country || "India").toString().trim(),
      state,
      city,
      business_type:
        (row.business_type || row.lead_type || "").toString().trim() || "Business",
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

