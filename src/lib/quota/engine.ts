/**
 * AROVA QUOTA ACCOUNTING ENGINE
 * 
 * Invariant:
 * remaining_quota = total_allocation - consumed_quota - reserved_quota
 * 
 * Rules:
 * 1. When a lead is offered -> reserve quota (reserved_quota + 1)
 * 2. When an offer is accepted -> convert reservation to consumed (reserved_quota - 1, consumed_quota + 1)
 * 3. When an offer is rejected or expires -> release reservation (reserved_quota - 1)
 * 4. When a prepared batch of N leads is unlocked -> charge eligible leads exactly once into consumed.
 * 5. All mutations require durable ledger entry with a unique idempotency_key.
 */

export interface QuotaState {
  totalAllocation: number;
  consumedQuota: number;
  reservedQuota: number;
}

export interface QuotaCalculation {
  remainingQuota: number;
  canReserve: boolean;
  canConsumeDirect: boolean;
  canUnlockBatch: (count: number) => { allowed: boolean; available: number };
}

/**
 * Pure calculation function to evaluate quota invariant.
 */
export function calculateQuota(state: QuotaState): QuotaCalculation {
  const { totalAllocation, consumedQuota, reservedQuota } = state;

  if (consumedQuota < 0 || reservedQuota < 0) {
    throw new Error('Quota numbers cannot be negative');
  }

  const remaining = totalAllocation - consumedQuota - reservedQuota;

  return {
    remainingQuota: Math.max(0, remaining),
    canReserve: remaining >= 1,
    canConsumeDirect: remaining >= 1,
    canUnlockBatch: (count: number) => {
      const allowed = remaining >= count;
      return {
        allowed,
        available: remaining,
      };
    },
  };
}

/**
 * Transition state for offering a lead (Reserves 1 quota unit)
 */
export function transitionOfferLead(state: QuotaState): QuotaState {
  const calc = calculateQuota(state);
  if (!calc.canReserve) {
    throw new Error(`Insufficient quota to offer lead: remaining=${calc.remainingQuota}`);
  }
  return {
    ...state,
    reservedQuota: state.reservedQuota + 1,
  };
}

/**
 * Transition state for accepting an offered lead (Converts 1 reservation to consumed)
 */
export function transitionAcceptLead(state: QuotaState): QuotaState {
  if (state.reservedQuota < 1) {
    throw new Error('No reserved quota available to convert to consumed');
  }
  return {
    ...state,
    reservedQuota: state.reservedQuota - 1,
    consumedQuota: state.consumedQuota + 1,
  };
}

/**
 * Transition state for rejecting or expiring an offered lead (Releases 1 reserved unit)
 */
export function transitionReleaseReservation(state: QuotaState): QuotaState {
  if (state.reservedQuota < 1) {
    throw new Error('No reserved quota available to release');
  }
  return {
    ...state,
    reservedQuota: state.reservedQuota - 1,
  };
}

/**
 * Transition state for unlocking a prepared batch of leads.
 * Directly increments consumed quota by eligible count.
 */
export function transitionUnlockPreparedBatch(state: QuotaState, eligibleCount: number): QuotaState {
  if (eligibleCount <= 0) return state;
  const calc = calculateQuota(state);
  if (calc.remainingQuota < eligibleCount) {
    throw new Error(
      `Insufficient quota to unlock batch: needed=${eligibleCount}, available=${calc.remainingQuota}`
    );
  }
  return {
    ...state,
    consumedQuota: state.consumedQuota + eligibleCount,
  };
}

/**
 * Helper to build an idempotency key for quota ledger transactions
 */
export function buildQuotaIdempotencyKey(
  action: string,
  entityId: string,
  timestampMs?: number
): string {
  const dateKey = timestampMs ? new Date(timestampMs).toISOString().split('T')[0] : '';
  return `arova_quota_${action}_${entityId}${dateKey ? `_${dateKey}` : ''}`;
}

