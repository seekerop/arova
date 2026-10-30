import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { APPROVED_CATEGORIES, ApprovedCategorySlug } from "@/lib/constants/categories";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbListSchema,
  buildCategoryServiceSchema,
} from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import {
  ShieldCheck,
  Clock,
  ArrowRight,
  Code2,
  Film,
  TrendingUp,
  ShoppingBag,
  Cpu,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
} from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_DETAILS: Record<
  ApprovedCategorySlug,
  {
    heroSub: string;
    targetBuyers: string[];
    typicalScopes: string[];
    averageBudgetINR: string;
    techStackExamples: string[];
  }
> = {
  "programming-software": {
    heroSub:
      "Direct verified requirements from Indian and global businesses seeking full-stack engineering, SaaS microservices, mobile apps, and custom database architectures.",
    targetBuyers: [
      "FinTech, HealthTech & PropTech founders requiring dedicated development squads",
      "Mid-sized manufacturing & retail enterprises modernizing internal ERP/CRM systems",
      "Funded tech startups needing Next.js, Node.js, and Supabase ledger microservices",
    ],
    typicalScopes: [
      "Internal operational dashboard with real-time settlement microservices",
      "Full-stack Next.js web application with Supabase auth and Stripe/Razorpay payments",
      "Cross-platform React Native / Flutter customer mobile application",
      "High-throughput REST and GraphQL API integrations with legacy databases",
    ],
    averageBudgetINR: "₹1,50,000 – ₹12,00,000",
    techStackExamples: ["Next.js", "React", "Node.js", "PostgreSQL", "Supabase", "TypeScript", "Python"],
  },
  "video-editing-production": {
    heroSub:
      "Commercial video post-production leads from high-growth brands, media houses, YouTube creators, and advertising agencies looking for reliable editors.",
    targetBuyers: [
      "B2B SaaS companies producing product walkthroughs and motion graphic promos",
      "Creator studios needing dedicated editors for long-form documentaries and podcasts",
      "D2C brands seeking high-converting short-form TikTok/Reels performance creative",
    ],
    typicalScopes: [
      "Long-form documentary post-production with sound design and motion branding",
      "Monthly package of 30 retention-optimized Reels/Shorts with animated captions",
      "SaaS product explainer with 3D/2D vector motion graphics and VO sync",
      "Multi-camera podcast multicam cut with audio cleanup and highlight clips",
    ],
    averageBudgetINR: "₹40,000 – ₹3,50,000 / project or monthly retainer",
    techStackExamples: ["Adobe Premiere Pro", "After Effects", "DaVinci Resolve", "Blender", "CapCut Pro"],
  },
  "digital-marketing-seo": {
    heroSub:
      "Performance marketing and organic growth opportunities from businesses looking to scale Google Ads, Meta Ads, and search ranking presence.",
    targetBuyers: [
      "Commercial solar, B2B hardware, and industrial equipment providers seeking qualified B2B leads",
      "D2C and lifestyle brands looking to decrease CAC on Meta and Google Shopping",
      "Professional service firms (legal, accounting, dental) aiming to dominate local SEO",
    ],
    typicalScopes: [
      "Full-funnel Google Search & Meta lead generation campaign with conversion tracking",
      "Technical SEO overhaul, schema implementation, and editorial topical authority build",
      "Conversion Rate Optimization (CRO) audit and A/B test setup for landing pages",
      "LinkedIn sponsored content and executive account-based marketing (ABM)",
    ],
    averageBudgetINR: "₹50,000 – ₹4,00,000 / month management + ad spend",
    techStackExamples: ["Google Ads", "Meta Ads Manager", "Google Analytics 4", "Semrush", "GTM"],
  },
  "website-ecommerce": {
    heroSub:
      "Verified e-commerce merchants and brands looking for Shopify 2.0 builds, headless storefronts, speed optimization, and custom WooCommerce stores.",
    targetBuyers: [
      "Established retail brands migrating from legacy platforms to Shopify 2.0",
      "High-volume D2C stores requiring sub-second mobile page loads and checkout optimizations",
      "B2B distributors needing wholesale portals with custom tier pricing and quote flows",
    ],
    typicalScopes: [
      "Shopify 2.0 theme customization with custom liquid sections and app integrations",
      "Headless Next.js storefront powered by Shopify Storefront API or Medusa.js",
      "WooCommerce to Shopify catalog migration with preserved SEO redirect mapping",
      "Mobile checkout speed optimization targeting >85 Google PageSpeed score",
    ],
    averageBudgetINR: "₹75,000 – ₹6,00,000",
    techStackExamples: ["Shopify Liquid", "Hydrogen", "Next.js", "Tailwind CSS", "WooCommerce"],
  },
  "business-automation-ai": {
    heroSub:
      "Enterprise and SME workflow automation leads seeking custom n8n pipelines, Make/Zapier automations, CRM integrations, and AI agent implementations.",
    targetBuyers: [
      "Service agencies spending 20+ hours weekly on manual data entry and invoice prep",
      "Logistics and supply chain businesses needing automatic ERP order status synchronization",
      "Real estate and financial brokerages implementing automatic WhatsApp AI lead qualifiers",
    ],
    typicalScopes: [
      "n8n / Make self-hosted workflow synchronizing CRM contacts with accounting and Slack",
      "Automated lead enrichment pipeline appending LinkedIn and MCA registry data",
      "WhatsApp Business API appointment booking bot connected to Google Calendar",
      "Custom internal LLM rag agent querying internal SOP docs for customer support",
    ],
    averageBudgetINR: "₹60,000 – ₹5,00,000",
    techStackExamples: ["n8n", "Make", "Zapier", "OpenAI API", "HubSpot", "PostgreSQL", "Webhooks"],
  },
};

export async function generateStaticParams() {
  return APPROVED_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = APPROVED_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return createPageMetadata({
      title: "Category Not Found",
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${category.name} Business Leads & Qualified Prospects`,
    description: `Discover verified B2B leads in ${category.name}. Access direct business requirements with our 48-hour review window and 30-day exclusive outreach guarantee.`,
    path: `/categories/${category.slug}`,
    keywords: [
      `${category.name} leads`,
      `${category.name} projects`,
      `B2B ${category.name} India`,
      `${category.shortName} clients`,
      "exclusive business leads",
      "verified prospect discovery",
      "Arova",
    ],
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = APPROVED_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const details = CATEGORY_DETAILS[category.slug as ApprovedCategorySlug];

  const breadcrumbItems = [
    { name: "Categories", path: "/categories" },
    { name: category.name, path: `/categories/${category.slug}` },
  ];

  const breadcrumbJsonLd = buildBreadcrumbListSchema(breadcrumbItems);
  const serviceJsonLd = buildCategoryServiceSchema(
    category.slug as ApprovedCategorySlug
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={serviceJsonLd} />

      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#A39E93]">
            <Link href="/" className="hover:text-[#F3F0E8] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#9E9B93]" />
            <Link href="/categories" className="hover:text-[#F3F0E8] transition-colors">
              Categories
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#9E9B93]" />
            <span className="text-[#FFAA3D] font-medium">{category.name}</span>
          </nav>

          {/* Hero Section */}
          <div className="space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161514] border border-[rgba(232,75,44,0.3)] shadow-[0_0_15px_rgba(232,75,44,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E84B2C]" />
              <span className="font-technical text-xs font-semibold tracking-wider text-[#FFAA3D] uppercase">
                VERIFIED CATEGORY DIRECTORY
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#F3F0E8]">
              {category.name}{" "}
              <span className="text-gradient-flame">Business Leads</span>
            </h1>

            <p className="text-base sm:text-lg text-[#D0CBC1] leading-relaxed">
              {details.heroSub}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/pricing">
                <Button size="lg" variant="primary" className="gap-2">
                  <span>Start Receiving {category.shortName} Leads</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline">
                  How Distribution Works
                </Button>
              </Link>
            </div>
          </div>

          <MandatoryDisclaimerBanner variant="short" />

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)]">
              <div className="space-y-2">
                <div className="text-[11px] font-technical uppercase tracking-wider text-[#A39E93]">
                  Typical Estimated Budget
                </div>
                <div className="font-technical text-2xl font-bold text-[#FFAA3D]">
                  {details.averageBudgetINR}
                </div>
                <p className="text-xs text-[#D0CBC1]">
                  Directly verified from prospect requirement filings before distribution.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)]">
              <div className="space-y-2">
                <div className="text-[11px] font-technical uppercase tracking-wider text-[#A39E93]">
                  Review Guarantee
                </div>
                <div className="font-technical text-2xl font-bold text-[#F3F0E8] flex items-center gap-2">
                  <Clock className="w-6 h-6 text-[#E84B2C]" />
                  <span>48h Review Window</span>
                </div>
                <p className="text-xs text-[#D0CBC1]">
                  Inspect scope and location preview before accepting and consuming quota.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)]">
              <div className="space-y-2">
                <div className="text-[11px] font-technical uppercase tracking-wider text-[#A39E93]">
                  Exclusivity Protection
                </div>
                <div className="font-technical text-2xl font-bold text-[#34D399] flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#34D399]" />
                  <span>30-Day Exclusive</span>
                </div>
                <p className="text-xs text-[#D0CBC1]">
                  Accepted leads are locked solely to your account. No other subscriber can claim it.
                </p>
              </div>
            </Card>
          </div>

          {/* Verified Scope Examples */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" size="sm">
                  REPRESENTATIVE SCOPES
                </Badge>
                <h2 className="font-display text-2xl font-bold text-[#F3F0E8]">
                  What Kind of {category.shortName} Requirements Are Sourced?
                </h2>
                <p className="text-xs text-[#A39E93] leading-relaxed">
                  Every lead includes a generalized project overview, technical requirements, and location data. Here are typical scopes distributed in this vertical:
                </p>
              </div>

              <div className="space-y-3">
                {details.typicalScopes.map((scope, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[10px] bg-[#111110] border border-[rgba(243,240,232,0.06)] flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#161514] border border-[rgba(232,75,44,0.3)] flex items-center justify-center shrink-0 mt-0.5 text-xs font-technical text-[#FFAA3D]">
                      {idx + 1}
                    </div>
                    <div className="text-xs text-[#D0CBC1] leading-relaxed">
                      {scope}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" size="sm">
                  PROSPECT PROFILE
                </Badge>
                <h2 className="font-display text-2xl font-bold text-[#F3F0E8]">
                  Who Submits These Requirements?
                </h2>
                <p className="text-xs text-[#A39E93] leading-relaxed">
                  We source verified commercial prospects actively seeking external agencies, freelancers, and technical consultancies:
                </p>
              </div>

              <div className="space-y-3">
                {details.targetBuyers.map((buyer, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[10px] bg-[#111110] border border-[rgba(243,240,232,0.06)] flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    <div className="text-xs text-[#D0CBC1] leading-relaxed">
                      {buyer}
                    </div>
                  </div>
                ))}
              </div>

              {/* Technologies / Tools Strip */}
              <div className="p-4 rounded-[10px] bg-[#161514] border border-[rgba(243,240,232,0.08)] space-y-2">
                <div className="text-[11px] font-technical uppercase tracking-wider text-[#FFAA3D]">
                  Relevant Toolsets & Standards
                </div>
                <div className="flex flex-wrap gap-2">
                  {details.techStackExamples.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-[4px] bg-[#111110] border border-[rgba(243,240,232,0.06)] text-[11px] font-technical text-[#F3F0E8]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cross-linking to Other Categories */}
          <div className="pt-12 border-t border-[rgba(243,240,232,0.08)] space-y-6">
            <h3 className="font-display text-xl font-bold text-[#F3F0E8]">
              Explore Other Approved Categories
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {APPROVED_CATEGORIES.filter((c) => c.slug !== category.slug).map(
                (other) => (
                  <Link
                    key={other.slug}
                    href={`/categories/${other.slug}`}
                    className="p-4 rounded-[10px] bg-[#111110] border border-[rgba(243,240,232,0.06)] hover:border-[rgba(232,75,44,0.35)] transition-all group space-y-1 block"
                  >
                    <div className="font-semibold text-xs text-[#F3F0E8] group-hover:text-[#FFAA3D] transition-colors flex items-center justify-between">
                      <span>{other.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A39E93] group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-[#A39E93] line-clamp-2">
                      {other.description}
                    </p>
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

