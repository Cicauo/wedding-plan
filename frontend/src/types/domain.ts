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

/**
 * Urgency level of an UNPAID term relative to its due date.
 * Drives visual urgency (pill color) + a human countdown label so
 * users never miss a payment ("Peace of Mind").
 *   overdue → past due            (red)
 *   soon    → due within 3 days   (orange)
 *   upcoming→ due in 4..7 days     (neutral, but surfaced)
 *   later   → > 7 days away        (neutral)
 *   none    → term is already paid
 */
export type UrgencyLevel = 'overdue' | 'soon' | 'upcoming' | 'later' | 'none';

export interface Urgency {
  level: UrgencyLevel;
  /** Whole days until due (negative = days overdue). */
  daysUntilDue: number;
  /** Human label, e.g. "Jatuh tempo 3 hari lagi" / "Terlambat 2 hari". */
  label: string;
}

/** Whole-day difference between two dates (date-only, TZ-safe-ish). */
function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86_400_000);
}

export function deriveUrgency(
  term: Pick<PaymentTerm, 'status' | 'dueDate'>,
  now: Date = new Date(),
): Urgency {
  if (term.status === 'PAID') {
    return { level: 'none', daysUntilDue: 0, label: '' };
  }

  const days = daysBetween(now, new Date(term.dueDate));

  if (days < 0) {
    const late = Math.abs(days);
    return {
      level: 'overdue',
      daysUntilDue: days,
      label: late === 0 ? 'Terlambat hari ini' : `Terlambat ${late} hari`,
    };
  }
  if (days === 0) {
    return { level: 'soon', daysUntilDue: 0, label: 'Jatuh tempo hari ini' };
  }
  if (days <= 3) {
    return { level: 'soon', daysUntilDue: days, label: `Jatuh tempo ${days} hari lagi` };
  }
  if (days <= 7) {
    return { level: 'upcoming', daysUntilDue: days, label: `Jatuh tempo ${days} hari lagi` };
  }
  return { level: 'later', daysUntilDue: days, label: `Jatuh tempo ${days} hari lagi` };
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

// ------------------------------------------------------------
// Phase 2 — Magic Automation (DERIVED views)
// ------------------------------------------------------------
// To-Do tasks and Budget entries are NOT stored. They are pure
// projections of vendors + payment terms. This guarantees "one
// status, many windows": marking a term paid anywhere updates
// every view because there is only ever ONE piece of state
// (PaymentTerm.status). Deleting a vendor/term cannot leave a
// "ghost task" because nothing was duplicated.

/**
 * A payment task shown in the To-Do list. Derived 1:1 from a
 * PaymentTerm. NON-EDITABLE by design — the source of truth is
 * the vendor detail page. The To-Do is only a window + a place to
 * mark done (which flips the underlying PaymentTerm.status).
 */
export interface PaymentTask {
  /** Same id as the source PaymentTerm — the single source of truth. */
  termId: string;
  vendorId: string;
  vendorName: string;
  category: VendorCategory;
  /** e.g. "Bayar Pelunasan ke Griya Dekorasi". */
  title: string;
  termName: string;
  amount: Rupiah;
  dueDate: ISODate;
  status: PaymentStatus;
  /** true when UNPAID and past due. */
  isOverdue: boolean;
  done: boolean;
  /** Pre-computed urgency (countdown / overdue label). */
  urgency: Urgency;
}

/**
 * Project vendors + terms into a sorted To-Do list of payment tasks.
 * Sort: overdue first, then by due date ascending; done tasks sink
 * to the bottom.
 */
export function derivePaymentTasks(
  vendors: Vendor[],
  terms: PaymentTerm[],
  now: Date = new Date(),
): PaymentTask[] {
  const vendorById = new Map(vendors.map((v) => [v.id, v]));

  const tasks: PaymentTask[] = terms.flatMap((term) => {
    const vendor = vendorById.get(term.vendorId);
    if (!vendor) return []; // orphan term (vendor deleted) → no ghost task
    const status = derivePaymentStatus(term, now);
    const urgency = deriveUrgency(term, now);
    return [
      {
        termId: term.id,
        vendorId: vendor.id,
        vendorName: vendor.name,
        category: vendor.category,
        title: `Bayar ${term.name} ke ${vendor.name}`,
        termName: term.name,
        amount: term.amount,
        dueDate: term.dueDate,
        status,
        isOverdue: status === 'OVERDUE',
        done: term.status === 'PAID',
        urgency,
      },
    ];
  });

  return tasks.sort((a, b) => {
    // Done tasks always last.
    if (a.done !== b.done) return a.done ? 1 : -1;
    // Overdue before on-time.
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    // Then earliest due date first.
    return a.dueDate.localeCompare(b.dueDate);
  });
}

/** One category row in the Budget Planner. */
export interface BudgetCategory {
  category: VendorCategory;
  label: string;
  /** SUM of vendor totalContract in this category (committed). */
  planned: Rupiah;
  /** SUM of PAID term amounts in this category (money actually out). */
  actual: Rupiah;
  vendorCount: number;
}

/** Whole-plan budget summary + per-category breakdown. */
export interface BudgetSummary {
  totalPlanned: Rupiah;
  totalActual: Rupiah;
  categories: BudgetCategory[];
}

/**
 * Project vendors + terms into a Budget view.
 * - Planned  = commitment = SUM(vendor.totalContract) per category.
 * - Actual   = money spent = SUM(term.amount where status === PAID).
 * Every vendor contributes a "planned expense" automatically the
 * moment it is created; actual accrues as terms are marked paid.
 */
export function deriveBudget(
  vendors: Vendor[],
  terms: PaymentTerm[],
): BudgetSummary {
  const byCategory = new Map<VendorCategory, BudgetCategory>();

  for (const vendor of vendors) {
    const row =
      byCategory.get(vendor.category) ??
      ({
        category: vendor.category,
        label: VENDOR_CATEGORY_LABELS[vendor.category],
        planned: 0,
        actual: 0,
        vendorCount: 0,
      } satisfies BudgetCategory);
    row.planned += vendor.totalContract;
    row.vendorCount += 1;
    byCategory.set(vendor.category, row);
  }

  const vendorCategory = new Map(vendors.map((v) => [v.id, v.category]));
  for (const term of terms) {
    if (term.status !== 'PAID') continue;
    const cat = vendorCategory.get(term.vendorId);
    if (!cat) continue; // orphan term
    const row = byCategory.get(cat);
    if (row) row.actual += term.amount;
  }

  const categories = [...byCategory.values()].sort(
    (a, b) => b.planned - a.planned,
  );

  return {
    totalPlanned: categories.reduce((s, c) => s + c.planned, 0),
    totalActual: categories.reduce((s, c) => s + c.actual, 0),
    categories,
  };
}
