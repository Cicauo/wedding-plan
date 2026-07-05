import { AlertCircle, Loader2, PiggyBank, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import type { BudgetCategory } from '@/types/domain';
import { useBudget } from './hooks';

function StatBox({ label, value, icon: Icon, accent }: { label: string; value: string; icon: LucideIcon; accent?: 'actual' }) {
  return (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${accent === 'actual' ? 'text-emerald-600' : 'text-foreground'}`}>
                {value}
            </div>
        </CardContent>
    </Card>
  );
}

function CategoryRow({ row }: { row: BudgetCategory }) {
  const pct = row.planned > 0 ? Math.min(row.actual / row.planned, 1) : 0;
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-medium text-foreground">{row.name}</p>
        <p className="text-sm font-semibold text-muted-foreground">{row.itemCount} item</p>
      </div>

      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className="absolute h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct * 100}%` }} />
      </div>

      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
        <span>Terpakai <strong className="font-semibold text-emerald-600">{formatCurrency(row.actual)}</strong></span>
        <span>Rencana <strong className="font-semibold text-foreground">{formatCurrency(row.planned)}</strong></span>
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const { budget, isLoading, isError, refetch } = useBudget();

  if (isLoading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="size-6 animate-spin" /></div>;
  }
  
  if (isError) {
    return <div className="mx-auto max-w-3xl px-6 py-8"><EmptyState icon={AlertCircle} title="Gagal memuat budget" description="Ada masalah saat mengambil data." action={<Button onClick={() => refetch()}>Coba lagi</Button>} /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Budget Planner</h1>
        <p className="text-sm text-muted-foreground">Rencana pengeluaran otomatis dari semua item expense-mu.</p>
      </header>

      {!budget || budget.categories.length === 0 ? (
        <EmptyState icon={PiggyBank} title="Budget masih kosong" description="Tambah item pengeluaran untuk melihat rangkuman budget di sini." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatBox label="Total Budget" value={formatCurrency(budget.totalBudget)} icon={Wallet} />
            <StatBox label="Total Rencana" value={formatCurrency(budget.totalPlanned)} icon={Wallet} />
            <StatBox label="Total Terpakai" value={formatCurrency(budget.totalActual)} icon={PiggyBank} accent="actual" />
          </div>

          <p className="text-sm text-muted-foreground">
            Dari budget <strong className="text-foreground">{formatCurrency(budget.totalBudget)}</strong>, 
            kamu berencana membelanjakan <strong className="text-foreground">{formatCurrency(budget.totalPlanned)}</strong>, 
            dan sudah terpakai <strong className="text-emerald-600">{formatCurrency(budget.totalActual)}</strong>.
          </p>

          <Card>
            <CardHeader><CardTitle>Rincian per Kategori</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {budget.categories.filter(c => c.itemCount > 0).map((row) => (
                <CategoryRow key={row.id} row={row} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
