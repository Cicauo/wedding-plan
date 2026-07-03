import { AlertCircle, Loader2, PiggyBank, Store, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/wedding/empty-state'
import { formatRupiah } from '@/lib/currency'
import type { BudgetCategory } from '@/types/domain'
import { useBudget } from './hooks'

function StatBox({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: typeof Wallet
  accent?: 'actual'
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4" />
        <p className="text-xs font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p
        className={
          'mt-1 text-xl font-bold tabular-nums ' +
          (accent === 'actual' ? 'text-status-paid-subtle-foreground' : 'text-foreground')
        }
      >
        {value}
      </p>
    </div>
  )
}

function CategoryRow({ row }: { row: BudgetCategory }) {
  const pct = row.planned > 0 ? Math.min(row.actual / row.planned, 1) : 0
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{row.label}</p>
          {/* Label: this budget entry came from the Vendor module */}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            <Store className="size-3" />
            {row.vendorCount} vendor
          </span>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">
          {Math.round(pct * 100)}%
        </p>
      </div>

      {/* Planned vs actual bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-status-paid transition-all"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Terpakai{' '}
          <strong className="tabular-nums text-status-paid-subtle-foreground">
            {formatRupiah(row.actual)}
          </strong>
        </span>
        <span className="text-muted-foreground">
          Rencana{' '}
          <strong className="tabular-nums text-foreground">
            {formatRupiah(row.planned)}
          </strong>
        </span>
      </div>
    </div>
  )
}

export default function BudgetPage() {
  const { budget, isLoading, isError, refetch } = useBudget()

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Budget Planner</h1>
        <p className="text-sm text-muted-foreground">
          Rencana pengeluaran dari kontrak vendormu, otomatis. Angka aktual naik
          tiap termin ditandai lunas.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Gagal memuat budget"
          description="Ada masalah saat mengambil data vendor."
          action={<Button onClick={refetch}>Coba lagi</Button>}
        />
      ) : !budget || budget.categories.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Budget masih kosong"
          description="Tambahkan vendor—total kontraknya otomatis tercatat sebagai rencana pengeluaran di sini."
        />
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid gap-3 sm:grid-cols-2">
            <StatBox
              label="Total Rencana"
              value={formatRupiah(budget.totalPlanned)}
              icon={Wallet}
            />
            <StatBox
              label="Total Terpakai"
              value={formatRupiah(budget.totalActual)}
              icon={PiggyBank}
              accent="actual"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Kamu sudah berkomitmen{' '}
            <strong className="text-foreground">{formatRupiah(budget.totalPlanned)}</strong>
            , dan benar-benar keluar uang{' '}
            <strong className="text-status-paid-subtle-foreground">
              {formatRupiah(budget.totalActual)}
            </strong>
            .
          </p>

          {/* Per-category */}
          <Card>
            <CardHeader>
              <CardTitle>Per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {budget.categories.map((row) => (
                <CategoryRow key={row.category} row={row} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
