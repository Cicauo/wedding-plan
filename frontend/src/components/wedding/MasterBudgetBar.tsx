import { cn } from '@/lib/utils'

interface MasterBudgetBarProps {
  total: number
  used: number
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

export function MasterBudgetBar({ total, used }: MasterBudgetBarProps) {
  const remaining = total - used
  const percentage = total > 0 ? (used / total) * 100 : 0
  
  const barColor =
    percentage > 100
      ? 'bg-red-500'
      : percentage > 80
      ? 'bg-yellow-500'
      : 'bg-primary'

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="grid grid-cols-3 divide-x divide-border">
        <div className="px-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">TOTAL ANGGARAN</p>
          <p className="text-lg font-semibold">{formatCurrency(total)}</p>
        </div>
        <div className="px-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">TERPAKAI</p>
          <p className="text-lg font-semibold">{formatCurrency(used)}</p>
        </div>
        <div className="px-2 text-center">
          <p className="text-sm font-medium text-muted-foreground">SISA</p>
          <p className="text-lg font-semibold">{formatCurrency(remaining)}</p>
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted">
        <div
          className={cn('h-2.5 rounded-full transition-all duration-500', barColor)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
