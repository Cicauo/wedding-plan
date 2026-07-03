import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/currency'
import type { Rupiah } from '@/types/domain'

interface PaymentProgressBarProps {
  paid: Rupiah
  total: Rupiah
  /** Show the "Rp X / Rp Y" caption above the bar. */
  showLabel?: boolean
  /** Tints the bar red when the vendor has an overdue term. */
  hasOverdue?: boolean
  className?: string
}

/**
 * PaymentProgressBar — primary visual for vendor payment progress.
 * Fully paid → green (done). Overdue → red (urgency). Otherwise
 * brand rose (in-progress). Accessible via role="progressbar".
 */
export function PaymentProgressBar({
  paid,
  total,
  showLabel = true,
  hasOverdue = false,
  className,
}: PaymentProgressBarProps) {
  const ratio = total > 0 ? Math.min(paid / total, 1) : 0
  const percent = Math.round(ratio * 100)
  const isComplete = ratio >= 1

  const barColor = isComplete
    ? 'bg-status-paid'
    : hasOverdue
      ? 'bg-status-overdue'
      : 'bg-primary'

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-medium tabular-nums text-foreground">
            {formatRupiah(paid)}
          </span>
          <span className="tabular-nums text-muted-foreground">
            / {formatRupiah(total)}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progres pembayaran ${percent}%`}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">{percent}% lunas</p>
      )}
    </div>
  )
}
