import { cva, type VariantProps } from 'class-variance-authority'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentStatus, UrgencyLevel } from '@/types/domain'

/**
 * StatusPill — small tag for payment status. Trust-critical:
 * color semantics come straight from the design tokens.
 *   PAID    → green  (safe / done)
 *   UNPAID  → gray   (no panic yet)
 *   OVERDUE → red    (urgency)
 *
 * Phase 3: extended with `soon` (orange, ≤3d) and `upcoming` (blue, ≤7d)
 * so users can see urgency at a glance without reading the date.
 */
const statusPillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5',
  {
    variants: {
      status: {
        PAID: 'bg-status-paid-subtle text-status-paid-subtle-foreground',
        UNPAID: 'bg-status-unpaid-subtle text-status-unpaid-subtle-foreground',
        OVERDUE: 'bg-status-overdue-subtle text-status-overdue-subtle-foreground',
        soon: 'bg-orange-100 text-orange-700',
        upcoming: 'bg-blue-100 text-blue-700',
      },
    },
    defaultVariants: { status: 'UNPAID' },
  },
)

/** All values the pill can accept as a visual token. */
type PillStatus = VariantProps<typeof statusPillVariants>['status']

/**
 * Map a PaymentStatus or UrgencyLevel to a known PillStatus.
 * Urgency `overdue` → OVERDUE (same red visual).
 * Urgency `later` / `none` → UNPAID (neutral).
 */
function toPillStatus(value: PaymentStatus | UrgencyLevel): PillStatus {
  switch (value) {
    case 'PAID':
      return 'PAID'
    case 'OVERDUE':
    case 'overdue':
      return 'OVERDUE'
    case 'soon':
      return 'soon'
    case 'upcoming':
      return 'upcoming'
    case 'later':
    case 'UNPAID':
    case 'none':
      return 'UNPAID'
  }
}

const STATUS_META: Record<PaymentStatus | UrgencyLevel, { label: string; Icon: typeof CheckCircle2 }> = {
  PAID: { label: 'Lunas', Icon: CheckCircle2 },
  UNPAID: { label: 'Belum Bayar', Icon: Clock },
  OVERDUE: { label: 'Jatuh Tempo', Icon: AlertTriangle },
  // Urgency variants
  overdue: { label: 'Terlambat', Icon: AlertTriangle },
  soon: { label: 'Mendesak', Icon: AlertTriangle },
  upcoming: { label: 'Mendekati', Icon: Clock },
  later: { label: 'Terjadwal', Icon: Clock },
  none: { label: '', Icon: CheckCircle2 },
}

interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  status: PaymentStatus | UrgencyLevel
  /** Hide the leading icon (e.g. in dense tables). */
  hideIcon?: boolean
}

export function StatusPill({ status, hideIcon, className, ...props }: StatusPillProps) {
  const { label, Icon } = STATUS_META[status]
  return (
    <span
      className={cn(statusPillVariants({ status: toPillStatus(status) }), className)}
      {...props}
    >
      {!hideIcon && <Icon aria-hidden />}
      {label}
    </span>
  )
}
