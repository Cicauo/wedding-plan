import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/currency'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PaymentProgressBar } from '@/components/wedding/payment-progress-bar'
import { VENDOR_CATEGORY_LABELS, type VendorWithProgress } from '@/types/domain'

interface VendorCardProps {
  vendor: VendorWithProgress
  onClick?: () => void
  className?: string
}

/**
 * VendorCard — list item for the vendor list. Surfaces the
 * payment progress bar as the primary visual and flags overdue
 * vendors with a subtle urgency indicator.
 */
export function VendorCard({ vendor, onClick, className }: VendorCardProps) {
  const interactive = Boolean(onClick)

  return (
    <Card
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      className={cn(
        interactive &&
          'cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        vendor.hasOverdue && 'border-status-overdue/40',
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-foreground">{vendor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {VENDOR_CATEGORY_LABELS[vendor.category]}
            </p>
          </div>
          {vendor.hasOverdue && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-status-overdue-subtle px-2 py-0.5 text-xs font-medium text-status-overdue-subtle-foreground">
              <AlertTriangle className="size-3.5" aria-hidden />
              Jatuh tempo
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <PaymentProgressBar
          paid={vendor.paidAmount}
          total={vendor.totalContract}
          hasOverdue={vendor.hasOverdue}
        />
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Sisa Tagihan</p>
            <p
              className={cn(
                'text-lg font-bold tabular-nums',
                vendor.remainingAmount === 0
                  ? 'text-status-paid-subtle-foreground'
                  : 'text-foreground',
              )}
            >
              {formatRupiah(vendor.remainingAmount)}
            </p>
          </div>
          <p className="pb-0.5 text-xs text-muted-foreground">
            {vendor.paidTermCount}/{vendor.termCount} termin lunas
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
