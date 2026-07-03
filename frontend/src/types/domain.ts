/**
 * ============================================================
 * DATA MODEL — Phase 0 Foundation
 * ============================================================
 * The agreed data contract between design & engineering.
 * This is the source of truth that Phase 2 automation
 * (Task generation + Budget entries) will build on.
 *
 * NOTE (money): all amounts are stored as INTEGER rupiah
 * (no decimals). Rp has no cents; using number-as-integer
 * avoids floating-point payment bugs entirely.
 *
 * TODO(backend): mirror this schema in Prisma when DB lands.
 *   Vendor 1..* PaymentTerm. `PaymentStatus.OVERDUE` is a
 *   DERIVED/UI-layer state — persist only UNPAID | PAID.
 * ============================================================
 */

/** Rupiah amount as a plain integer (e.g. 15_000_000 = Rp 15.000.000). */
export type Rupiah = number;

/** ISO 8601 date string, e.g. "2026-09-12". */
export type ISODate = string;

// ------------------------------------------------------------
// Enums
// ------------------------------------------------------------

/**
 * Vendor categories. Drives the category dropdown + grouping.
 * TODO(product): confirm final taxonomy with PM.
 */
export const VENDOR_CATEGORIES = [
  'venue',
  'catering',
  'photography',
  'decoration',
  'attire',
  'entertainment',
  'invitation',
  'transportation',
  'other',
] as const;

export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: 'Venue',
  catering: 'Katering',
  photography: 'Fotografi',
  decoration: 'Dekorasi',
  attire: 'Busana',
  entertainment: 'Hiburan',
  invitation: 'Undangan',
  transportation: 'Transportasi',
  other: 'Lainnya',
};

/**
 * Persisted payment status. Only two states are ever stored.
 * OVERDUE is computed at read-time (see `derivePaymentStatus`).
 */
export type StoredPaymentStatus = 'UNPAID' | 'PAID';

/**
 * Effective status used by the UI (3-state). OVERDUE is derived
 * from an UNPAID term whose due date has passed.
 */
export type PaymentStatus = 'UNPAID' | 'PAID' | 'OVERDUE';

// ------------------------------------------------------------
// Entities
// ------------------------------------------------------------

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  /** Total contract value in integer rupiah. */
  totalContract: Rupiah;
  contact?: string;
  contractUrl?: string;
  createdAt: ISODate;
}

export interface PaymentTerm {
  id: string;
  vendorId: string;
  /** e.g. "DP", "Pelunasan", "Termin 2". */
  name: string;
  amount: Rupiah;
  dueDate: ISODate;
  /** Persisted status — never stores OVERDUE. */
  status: StoredPaymentStatus;
}

// ------------------------------------------------------------
// Derived / computed views (single source of truth)
// ------------------------------------------------------------

/**
 * Vendor enriched with computed payment progress.
 * Never persisted — always derived from its PaymentTerms so
 * there's exactly one source of truth for "how much is paid".
 */
export interface VendorWithProgress extends Vendor {
  paidAmount: Rupiah;
  /** Sisa Tagihan = total − paid. The number users look for most. */
  remainingAmount: Rupiah;
  /** total − SUM(all term amounts). >0 means money not yet scheduled. */
  unscheduledAmount: Rupiah;
  /** 0..1 ratio of paidAmount / totalContract. */
  progress: number;
  termCount: number;
  paidTermCount: number;
  /** True if any term is OVERDUE — drives the urgency indicator. */
  hasOverdue: boolean;
}

/**
 * Compute the effective (3-state) status for a term.
 * OVERDUE = unpaid AND due date already passed.
 */
export function derivePaymentStatus(
  term: Pick<PaymentTerm, 'status' | 'dueDate'>,
  now: Date = new Date(),
): PaymentStatus {
  if (term.status === 'PAID') return 'PAID';
  return new Date(term.dueDate) < now ? 'OVERDUE' : 'UNPAID';
}

/** Aggregate a vendor + its terms into a progress view. */
export function computeVendorProgress(
  vendor: Vendor,
  terms: PaymentTerm[],
  now: Date = new Date(),
): VendorWithProgress {
  const vendorTerms = terms.filter((t) => t.vendorId === vendor.id);
  const paidTerms = vendorTerms.filter((t) => t.status === 'PAID');
  const paidAmount = paidTerms.reduce((sum, t) => sum + t.amount, 0);
  const scheduledAmount = vendorTerms.reduce((sum, t) => sum + t.amount, 0);
  const hasOverdue = vendorTerms.some(
    (t) => derivePaymentStatus(t, now) === 'OVERDUE',
  );

  return {
    ...vendor,
    paidAmount,
    remainingAmount: Math.max(vendor.totalContract - paidAmount, 0),
    unscheduledAmount: vendor.totalContract - scheduledAmount,
    progress:
      vendor.totalContract > 0 ? paidAmount / vendor.totalContract : 0,
    termCount: vendorTerms.length,
    paidTermCount: paidTerms.length,
    hasOverdue,
  };
}
