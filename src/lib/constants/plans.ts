/**
 * AROVA SUBSCRIPTION PLANS SPECIFICATION
 * Integer monetary units: Paise (₹1 = 100 paise)
 */

export const SUBSCRIPTION_PLANS = [
  {
    code: 'starter' as const,
    name: 'Starter',
    priceINR: 499,
    pricePaise: 49900,
    leadAllocation: 40,
    billingPeriodDays: 30,
    features: [
      '40 verified business leads per 30 days',
      'Exclusive 30-day claim on accepted leads',
      '48-hour review window per delivered lead',
      'Select any of the 5 approved service categories',
      'Location and city targeting preference',
      'Safe preview before quota commitment',
      'Data accuracy replacement guarantee',
    ],
    popular: false,
    disclaimer: '40 prospect records allocated. Leads are business prospects, not guaranteed clients.',
  },
  {
    code: 'growth' as const,
    name: 'Growth',
    priceINR: 999,
    pricePaise: 99900,
    leadAllocation: 100,
    billingPeriodDays: 30,
    features: [
      '100 verified business leads per 30 days',
      'Exclusive 30-day claim on accepted leads',
      '48-hour review window per delivered lead',
      'Multi-category distribution support',
      'Priority delivery throughout the billing cycle',
      'Safe preview before quota commitment',
      'Data accuracy replacement guarantee',
      'Direct contact profile & source audit access',
    ],
    popular: true,
    disclaimer: '100 prospect records allocated. Leads are business prospects, not guaranteed clients.',
  },
] as const;

export type PlanCode = typeof SUBSCRIPTION_PLANS[number]['code'];

export function getPlanByCode(code: string) {
  return SUBSCRIPTION_PLANS.find((p) => p.code === code) || null;
}

