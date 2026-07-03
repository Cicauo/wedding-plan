import { cva, type VariantProps } from 'class-variance-authority'
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaymentStatus } from '@/types/domain'

/**
 * StatusPill — small tag for payment status. Trust-critical:
 * color semantics come straight from the design tokens.
 *   PAID    → green  (safe / done)
 *   UNPAID  → gray   (no panic yet)
 *   OVERDUE → red    (urgency)
 */
const statusPillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5',
  {
    variants: {
      status: {
        PAID: 'bg-status-paid-subtle text-status-paid-subtle-foreground',
        UNPAID: 'bg-status-unpaid-subtle text-status-unpaid-subtle-foreground',
        OVERDUE: 'bg-status-overdue-subtle text-status-overdue-subtle-foreground',
      },
    },
    defaultVariants: { status: 'UNPAID' },
  },
)

const STATUS_META: Record<
  PaymentStatus,
  { label: string; Icon: typeof CheckCircle2 }
> = {
  PAID: { label: 'Lunas', Icon: CheckCircle2 },
  UNPAID: { label: 'Belum Bayar', Icon: Clock },
  OVERDUE: { label: 'Jatuh Tempo', Icon: AlertTriangle },
}

interface StatusPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'>,
    VariantProps<typeof statusPillVariants> {
  status: PaymentStatus
  /** Hide the leading icon (e.g. in dense tables). */
  hideIcon?: boolean
}

export function StatusPill({ status, hideIcon, className, ...props }: StatusPillProps) {
  const { label, Icon } = STATUS_META[status]
  return (
    <span className={cn(statusPillVariants({ status }), className)} {...props}>
      {!hideIcon && <Icon aria-hidden />}
      {label}
    </span>
  )
}
