/**
 * Centralized Legal & Business Information for Arova
 * Compliant with Indian Consumer Protection (E-Commerce) Rules 2020,
 * Information Technology Act 2000, and Razorpay Merchant Verification Standards.
 */

export const BUSINESS_CONFIG = {
  legalEntityName: "Arenova Technologies",
  brandName: "Arova",
  commercialName: "Arova by Arenova",
  domain: "https://arova.arenova.in",
  parentDomain: "https://arenova.in",

  description:
    "Arova is a specialized B2B lead intelligence and commercial prospect platform under Arenova Technologies, delivering curated business leads with 30-day exclusive outreach protection.",

  // Contact Details for Razorpay Verification
  contact: {
    supportEmail: "support@arenova.in",
    salesEmail: "sales@arenova.in",
    billingEmail: "billing@arenova.in",
    helplinePhone: "+91 98200 44556",
    operatingHours: "Monday to Friday: 10:00 AM – 6:00 PM IST",
    workingDays: "Monday – Friday (Closed on Indian National Holidays)",
    ticketResolutionSLA: "Within 24 to 48 business hours",
  },

  // Physical Operating Address (Mandated by Razorpay KYC & Indian E-Commerce Rules)
  registeredAddress: {
    building: "Arenova Digital Hub, Tower B, Level 4",
    street: "Outer Ring Road, Kadubeesanahalli",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    pincode: "560103",
    formatted:
      "Arenova Technologies, Tower B, Level 4, Outer Ring Road, Kadubeesanahalli, Bengaluru, Karnataka 560103, India",
  },

  // Grievance Redressal Officer (Mandated under IT Rules, 2021)
  grievanceOfficer: {
    name: "Rohan Malhotra",
    designation: "Grievance Redressal & Compliance Officer",
    email: "grievance@arenova.in",
    phone: "+91 98200 44556",
    address:
      "Arenova Technologies, Tower B, Level 4, Outer Ring Road, Bengaluru, Karnataka 560103, India",
    responseSLA: "Acknowledgment within 48 hours; resolution within 15 working days",
  },

  // Authorized Payment Gateway Partner Details
  paymentGateway: {
    partnerName: "Razorpay",
    partnerLegalName: "Razorpay Software Private Limited",
    website: "https://razorpay.com",
    securityTier: "PCI-DSS Level 1 Certified · 256-Bit SSL Encryption",
    currency: "INR (Indian Rupee, ₹)",
    acceptedPaymentModes: [
      "UPI (Google Pay, PhonePe, Paytm, BHIM, Cred)",
      "Credit & Debit Cards (Visa, MasterCard, RuPay, Maestro, American Express)",
      "Net Banking (50+ Leading Indian Banks including HDFC, ICICI, SBI, Axis)",
      "Authorized Indian Wallets & UPI Autopay",
    ],
    payoutRefundTimeline: "5 to 7 business working days to original payment source",
  },
} as const;
