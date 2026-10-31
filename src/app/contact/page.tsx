import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/contact-form";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { BUSINESS_CONFIG } from "@/lib/constants/business";
import { Mail, Clock, ShieldCheck, MapPin, Phone, UserCheck } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us — Support, Operating Address & Grievance Redressal",
  description:
    "Official contact channels for Arova by Arenova Technologies. Operating address, support email, telephone helpline, operating hours, and statutory grievance officer details.",
  path: "/contact",
  keywords: [
    "contact Arova",
    "Arenova Technologies address",
    "Arova customer care",
    "Arova grievance officer",
    "Razorpay merchant support",
  ],
});

export default function ContactPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Contact", path: "/contact" },
  ]);

  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `Contact ${BUSINESS_CONFIG.brandName} Support`,
    url: `${BUSINESS_CONFIG.domain}/contact`,
    description: `Official support, corporate headquarters, and grievance redressal desk for ${BUSINESS_CONFIG.commercialName}.`,
    mainEntity: {
      "@type": "Organization",
      name: BUSINESS_CONFIG.legalEntityName,
      alternateName: BUSINESS_CONFIG.brandName,
      url: BUSINESS_CONFIG.parentDomain,
      email: BUSINESS_CONFIG.contact.supportEmail,
      telephone: BUSINESS_CONFIG.contact.helplinePhone,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${BUSINESS_CONFIG.registeredAddress.building}, ${BUSINESS_CONFIG.registeredAddress.street}`,
        addressLocality: BUSINESS_CONFIG.registeredAddress.city,
        addressRegion: BUSINESS_CONFIG.registeredAddress.state,
        postalCode: BUSINESS_CONFIG.registeredAddress.pincode,
        addressCountry: "IN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: BUSINESS_CONFIG.contact.helplinePhone,
        contactType: "customer support",
        email: BUSINESS_CONFIG.contact.supportEmail,
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={[breadcrumbJsonLd, contactPageSchema]} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              SUPPORT & STATUTORY CONTACT
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              Contact the Arova Team
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              Have questions regarding our subscriptions, billing, lead replacements, or enterprise allocations? Our team responds within 24 to 48 business hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {/* Direct Support */}
              <div className="p-5 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-2">
                <div className="flex items-center gap-2 text-[#E84B2C]">
                  <Mail className="w-4 h-4" />
                  <h3 className="font-display text-xs font-semibold text-[#F3F0E8]">
                    Support & Billing Desk
                  </h3>
                </div>
                <p className="text-xs text-[#D0CBC1]">
                  <a href={`mailto:${BUSINESS_CONFIG.contact.supportEmail}`} className="hover:text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.contact.supportEmail}
                  </a>
                </p>
                <p className="text-[11px] text-[#A39E93]">
                  Billing queries:{" "}
                  <a href={`mailto:${BUSINESS_CONFIG.contact.billingEmail}`} className="hover:text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.contact.billingEmail}
                  </a>
                </p>
              </div>

              {/* Phone Helpline */}
              <div className="p-5 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-2">
                <div className="flex items-center gap-2 text-[#34D399]">
                  <Phone className="w-4 h-4" />
                  <h3 className="font-display text-xs font-semibold text-[#F3F0E8]">
                    Helpline & Customer Care
                  </h3>
                </div>
                <p className="text-xs text-[#F3F0E8] font-technical">
                  {BUSINESS_CONFIG.contact.helplinePhone}
                </p>
                <p className="text-[11px] text-[#A39E93]">
                  Available {BUSINESS_CONFIG.contact.operatingHours}
                </p>
              </div>

              {/* Operating Address (Razorpay Mandate) */}
              <div className="p-5 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-2">
                <div className="flex items-center gap-2 text-[#FFAA3D]">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-display text-xs font-semibold text-[#F3F0E8]">
                    Registered Corporate Address
                  </h3>
                </div>
                <p className="text-xs text-[#D0CBC1] leading-relaxed">
                  <strong>{BUSINESS_CONFIG.legalEntityName}</strong><br />
                  {BUSINESS_CONFIG.registeredAddress.building}<br />
                  {BUSINESS_CONFIG.registeredAddress.street}<br />
                  {BUSINESS_CONFIG.registeredAddress.city}, {BUSINESS_CONFIG.registeredAddress.state} – {BUSINESS_CONFIG.registeredAddress.pincode}<br />
                  {BUSINESS_CONFIG.registeredAddress.country}
                </p>
              </div>

              {/* Operating Hours */}
              <div className="p-5 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-2">
                <div className="flex items-center gap-2 text-[#A39E93]">
                  <Clock className="w-4 h-4" />
                  <h3 className="font-display text-xs font-semibold text-[#F3F0E8]">
                    Operational Hours & SLA
                  </h3>
                </div>
                <p className="text-xs text-[#D0CBC1]">
                  {BUSINESS_CONFIG.contact.operatingHours}<br />
                  <span className="text-[11px] text-[#9E9B93]">{BUSINESS_CONFIG.contact.workingDays}</span>
                </p>
                <p className="text-[11px] text-[#34D399]">
                  Ticket Response SLA: {BUSINESS_CONFIG.contact.ticketResolutionSLA}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <ContactForm />
            </div>
          </div>

          {/* Statutory Grievance Redressal Officer (Mandated under IT Rules, 2021) */}
          <Card className="p-6 md:p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
            <div className="flex items-center gap-2.5 text-[#FFAA3D]">
              <UserCheck className="w-5 h-5" />
              <h3 className="font-display text-base font-bold text-[#F3F0E8]">
                Statutory Grievance Redressal Officer
              </h3>
            </div>
            <p className="text-xs text-[#D0CBC1] leading-relaxed">
              In accordance with the <strong>Information Technology Act, 2000</strong> and the <strong>Consumer Protection (E-Commerce) Rules, 2020</strong>, the contact details of the Grievance Officer for {BUSINESS_CONFIG.commercialName} are provided below:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] text-xs">
              <div>
                <span className="text-[#A39E93] block">Officer Name:</span>
                <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.grievanceOfficer.name}</strong>
              </div>
              <div>
                <span className="text-[#A39E93] block">Designation:</span>
                <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.grievanceOfficer.designation}</strong>
              </div>
              <div>
                <span className="text-[#A39E93] block">Email:</span>
                <a href={`mailto:${BUSINESS_CONFIG.grievanceOfficer.email}`} className="text-[#FFAA3D] underline">
                  {BUSINESS_CONFIG.grievanceOfficer.email}
                </a>
              </div>
              <div>
                <span className="text-[#A39E93] block">Telephone:</span>
                <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.grievanceOfficer.phone}</strong>
              </div>
            </div>
            <p className="text-[11px] text-[#9E9B93]">
              SLA: {BUSINESS_CONFIG.grievanceOfficer.responseSLA}. Postal communications should be addressed to the Grievance Officer at our registered address above.
            </p>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
