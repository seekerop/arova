/**
 * APPROVED AROVA CATEGORIES — STRICT NON-NEGOTIABLE SPECIFICATION
 * Exactly five flat categories. NO subcategories anywhere.
 */

export const APPROVED_CATEGORIES = [
  {
    slug: 'programming-software',
    name: 'Programming & Software',
    shortName: 'Software',
    description: 'Custom web apps, APIs, backend architectures, mobile applications, and technical software development.',
    icon: 'Code2',
  },
  {
    slug: 'video-editing-production',
    name: 'Video Editing & Production',
    shortName: 'Video',
    description: 'Commercial video post-production, motion graphics, YouTube editing, reels/shorts, and brand storytelling.',
    icon: 'Film',
  },
  {
    slug: 'digital-marketing-seo',
    name: 'Digital Marketing & SEO',
    shortName: 'Marketing',
    description: 'Search engine optimization, Google Ads, Meta advertising, conversion rate optimization, and growth marketing.',
    icon: 'TrendingUp',
  },
  {
    slug: 'website-ecommerce',
    name: 'Website & E-commerce',
    shortName: 'E-commerce',
    description: 'High-converting Shopify stores, WooCommerce builds, landing pages, and responsive business websites.',
    icon: 'ShoppingBag',
  },
  {
    slug: 'business-automation-ai',
    name: 'Business Automation & AI',
    shortName: 'Automation',
    description: 'CRM setup, automated pipeline workflows (n8n/Make/Zapier), lead routing, and business system automation.',
    icon: 'Cpu',
  },
] as const;

export type ApprovedCategoryName = typeof APPROVED_CATEGORIES[number]['name'];
export type ApprovedCategorySlug = typeof APPROVED_CATEGORIES[number]['slug'];

/**
 * Validates whether a category string is one of the 5 approved flat categories.
 * Case-insensitive and trimmed. Returns the canonical name or null if invalid.
 */
export function normalizeCategoryName(rawCategory: string | null | undefined): ApprovedCategoryName | null {
  if (!rawCategory) return null;
  const clean = rawCategory.trim().toLowerCase();

  for (const cat of APPROVED_CATEGORIES) {
    if (
      clean === cat.name.toLowerCase() ||
      clean === cat.slug.toLowerCase() ||
      clean === cat.shortName.toLowerCase()
    ) {
      return cat.name;
    }
  }

  // Handle common variations cleanly to map to the 5 approved categories
  if (clean.includes('software') || clean.includes('programming') || clean.includes('coding') || clean.includes('developer')) {
    return 'Programming & Software';
  }
  if (clean.includes('video') || clean.includes('editing') || clean.includes('motion') || clean.includes('production')) {
    return 'Video Editing & Production';
  }
  if (clean.includes('seo') || clean.includes('marketing') || clean.includes('ads') || clean.includes('sem')) {
    return 'Digital Marketing & SEO';
  }
  if (clean.includes('website') || clean.includes('ecommerce') || clean.includes('e-commerce') || clean.includes('shopify')) {
    return 'Website & E-commerce';
  }
  if (clean.includes('automation') || clean.includes('workflow') || clean.includes('zapier') || clean.includes('n8n')) {
    return 'Business Automation & AI';
  }

  return null;
}

export function isApprovedCategory(name: string): name is ApprovedCategoryName {
  return APPROVED_CATEGORIES.some((c) => c.name === name);
}

