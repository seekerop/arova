export type ArovaRole = 'admin' | 'customer';

export type SubscriptionStatus =
  | 'created'
  | 'authenticated'
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'completed'
  | 'expired';

export type QuotaTxType =
  | 'grant'
  | 'reserve'
  | 'consume'
  | 'release'
  | 'adjustment'
  | 'refund';

export type LeadQualityStatus =
  | 'verified'
  | 'unverified'
  | 'flagged'
  | 'inaccurate';

export type LeadAvailabilityStatus =
  | 'available'
  | 'reserved'
  | 'claimed'
  | 'archived'
  | 'invalid';

export type LeadRequestStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Preparing'
  | 'Ready'
  | 'Unlocked'
  | 'Rejected'
  | 'Cancelled';

export type DeliveryStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

export type ClaimStatus = 'active' | 'expired' | 'released' | 'extended';

export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded';

export type WebhookEventStatus = 'received' | 'processed' | 'failed' | 'ignored';

export type FeedbackIssueType =
  | 'inaccurate_phone'
  | 'inaccurate_email'
  | 'closed_business'
  | 'wrong_category'
  | 'duplicate'
  | 'other';

export type FeedbackStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role: ArovaRole;
  created_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Plan {
  id: string;
  code: 'starter' | 'growth';
  name: string;
  price_paise: number;
  lead_allocation: number;
  billing_period_days: number;
  razorpay_plan_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  razorpay_subscription_id: string | null;
  razorpay_customer_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  disclosure_ack_at: string | null;
  disclosure_version: string | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface QuotaPeriod {
  id: string;
  user_id: string;
  subscription_id: string;
  period_start: string;
  period_end: string;
  total_allocation: number;
  consumed_quota: number;
  reserved_quota: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuotaLedgerEntry {
  id: string;
  user_id: string;
  quota_period_id: string;
  amount: number;
  balance_after: number;
  transaction_type: QuotaTxType;
  idempotency_key: string;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  category_id: string;
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
  collection_date: string;
  verification_date: string | null;
  data_quality_status: LeadQualityStatus;
  availability_status: LeadAvailabilityStatus;
  import_batch_id: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

/**
 * Lead Preview type: Masks sensitive contact details until verified acceptance.
 * Business identifying info, phone, email, and revealing URLs are omitted.
 */
export interface LeadSafePreview {
  id: string;
  category_id: string;
  category_name?: string;
  generalized_requirement: string;
  estimated_value_paise: number | null;
  estimated_value_currency: string;
  country: string;
  state: string | null;
  city: string;
  business_type: string | null;
  tags: string[];
  collection_date: string;
  data_quality_status: LeadQualityStatus;
  is_locked: boolean;
}

export interface LeadRequest {
  id: string;
  user_id: string;
  category_id: string;
  requested_quantity: number;
  location_preference: string | null;
  notes: string | null;
  status: LeadRequestStatus;
  admin_rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  items?: LeadRequestItem[];
}

export interface LeadRequestItem {
  id: string;
  request_id: string;
  lead_id: string;
  created_at: string;
  lead?: Lead;
}

export interface LeadDelivery {
  id: string;
  user_id: string;
  lead_id: string;
  quota_period_id: string;
  delivered_at: string;
  response_deadline: string; // 48h after delivered_at
  status: DeliveryStatus;
  responded_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  lead?: Lead;
}

export interface LeadClaim {
  id: string;
  user_id: string;
  lead_id: string;
  delivery_id: string | null;
  quota_period_id: string;
  claimed_at: string;
  expires_at: string; // 30 days after claimed_at
  status: ClaimStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_order_id: string | null;
  razorpay_signature: string | null;
  amount_paise: number;
  currency: string;
  status: PaymentStatus;
  error_code: string | null;
  error_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportBatch {
  id: string;
  admin_user_id: string | null;
  filename: string;
  file_size_bytes: number;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  duplicate_rows: number;
  imported_rows: number;
  skipped_rows: number;
  status: string;
  error_summary: Record<string, unknown> | null;
  created_at: string;
}

export interface LeadFeedback {
  id: string;
  user_id: string;
  lead_id: string;
  issue_type: FeedbackIssueType;
  description: string;
  status: FeedbackStatus;
  admin_resolution_notes: string | null;
  replacement_lead_id: string | null;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'offer' | 'claim' | 'subscription' | 'warning' | 'success';
  is_read: boolean;
  link_url: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_entity: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
