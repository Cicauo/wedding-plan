import { motion } from 'motion/react';
import type { Rupiah } from '@/types/domain';
import { formatCurrency, cn } from '@/lib/utils';
import { useAnimatedNumber } from '@/lib/use-animated-number';

interface MasterBudgetBarProps {
  /** Total budget the couple set for the wedding. */
  totalBudget: Rupiah;
  /** Sum of all planned expenses (paid + unpaid). */
  totalExpenses: Rupiah;
  /** Sum of everything actually paid so far. */
  totalPaid: Rupiah;
}

/** A single animated money figure with a caption. */
function Figure({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'positive' | 'negative';
}) {
  const animated = useAnimatedNumber(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          'text-lg font-bold tabular-nums sm:text-xl',
          tone === 'positive' && 'text-emerald-600',
          tone === 'negative' && 'text-destructive',
          tone === 'default' && 'text-foreground',
        )}
      >
        {formatCurrency(Math.round(animated))}
      </span>
    </div>
  );
}

export function MasterBudgetBar({ totalBudget, totalExpenses, totalPaid }: MasterBudgetBarProps) {
  const remaining = totalBudget - totalExpenses;
  const isOverBudget = remaining < 0;

  // Bar segments are expressed as a % of the budget (clamped for over-budget).
  const denom = Math.max(totalBudget, totalExpenses, 1);
  const paidPct = Math.min((totalPaid / denom) * 100, 100);
  const plannedPct = Math.min((totalExpenses / denom) * 100, 100);

  // Narrative label for screen readers, e.g.
  // "Anggaran terpakai 51 persen. Sisa Rp 121.500.000 dari total Rp 250.000.000."
  const usedPct = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
  const srSummary = isOverBudget
    ? `Anggaran melebihi budget. Terpakai ${usedPct} persen, kelebihan ${formatCurrency(Math.abs(remaining))} dari total ${formatCurrency(totalBudget)}.`
    : `Anggaran terpakai ${usedPct} persen. Sisa ${formatCurrency(remaining)} dari total ${formatCurrency(totalBudget)}.`;

  return (
    <div
      className="sticky top-4 z-20 rounded-xl border bg-card/95 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80"
      role="region"
      aria-label="Ringkasan anggaran"
    >
      {/* Screen-reader narrative — mirrors the visual figures + bar. */}
      <p className="sr-only" aria-live="polite">{srSummary}</p>

      <div className="mb-4 grid grid-cols-3 gap-4">
        <Figure label="Total Budget" value={totalBudget} />
        <Figure label="Terpakai" value={totalExpenses} tone={isOverBudget ? 'negative' : 'default'} />
        <Figure label="Sisa" value={remaining} tone={isOverBudget ? 'negative' : 'positive'} />
      </div>

      {/* Stacked progress bar: paid (solid) over planned (muted) over budget (track) */}
      <div
        className="relative h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={totalBudget}
        aria-valuenow={totalExpenses}
        aria-label="Ringkasan penggunaan budget"
      >
        {/* Planned (allocated but not fully paid) */}
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isOverBudget ? 'bg-destructive/40' : 'bg-primary/25',
          )}
          initial={false}
          animate={{ width: `${plannedPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
        {/* Paid (actual money out) */}
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full',
            isOverBudget ? 'bg-destructive' : 'bg-primary',
          )}
          initial={false}
          animate={{ width: `${paidPct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={cn('size-2.5 rounded-full', isOverBudget ? 'bg-destructive' : 'bg-primary')} />
          Lunas · {formatCurrency(totalPaid)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('size-2.5 rounded-full', isOverBudget ? 'bg-destructive/40' : 'bg-primary/25')} />
          Dialokasikan · {formatCurrency(totalExpenses)}
        </span>
        {isOverBudget && (
          <span className="font-semibold text-destructive">
            ⚠ Melebihi budget {formatCurrency(Math.abs(remaining))}
          </span>
        )}
      </div>
    </div>
  );
}
