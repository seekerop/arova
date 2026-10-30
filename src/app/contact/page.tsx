import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contact/contact-form";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { Mail, Clock, ShieldCheck } from "lucide-react";
import { SEO_CONFIG } from "@/lib/seo/config";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us — Support & Enterprise Inquiries",
  description:
    "Get in touch with the Arova business intelligence team. Inquire about custom lead allocations, enterprise subscriptions, or platform assistance under the Arenova ecosystem.",
  path: "/contact",
  keywords: [
    "contact Arova",
    "Arova support",
    "B2B lead support",
    "Arenova contact",
  ],
});

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Contact", path: "/contact" },
  ]);

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Arova Support",
    url: `${SEO_CONFIG.siteUrl}/contact`,
    description: "Support and enterprise inquiry channel for Arova business lead platform.",
    mainEntity: {
      "@type": "Organization",
      name: SEO_CONFIG.brand.name,
      email: SEO_CONFIG.contact.email,
      url: SEO_CONFIG.siteUrl,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={[breadcrumbJsonLd, contactPageSchema]} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              SUPPORT & INQUIRIES
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              Contact the Arova Team
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              Have questions regarding our subscriptions, enterprise quota allocations, or custom category requirements? We respond promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                <Mail className="w-5 h-5 text-[#E84B2C]" />
                <h3 className="font-display text-sm font-semibold text-[#F3F0E8]">
                  Direct Support
                </h3>
                <p className="text-xs text-[#A39E93]">
                  support@arenova.in
                </p>
              </div>

              <div className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                <Clock className="w-5 h-5 text-[#FFAA3D]" />
                <h3 className="font-display text-sm font-semibold text-[#F3F0E8]">
                  Operational Hours
                </h3>
                <p className="text-xs text-[#A39E93]">
                  Monday – Friday<br />
                  10:00 AM – 7:00 PM IST
                </p>
              </div>

              <div className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                <ShieldCheck className="w-5 h-5 text-[#34D399]" />
                <h3 className="font-display text-sm font-semibold text-[#F3F0E8]">
                  Arenova Ecosystem
                </h3>
                <p className="text-xs text-[#A39E93]">
                  Arova operates as a specialized B2B intelligence platform under Arenova Technologies.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <ContactForm />
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
