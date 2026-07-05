import { Plus, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MasterBudgetBar } from '@/components/overview/MasterBudgetBar';
import { OneTimeExpenseCard } from '@/components/expenses/OneTimeExpenseCard';
import { InstallmentExpenseCard } from '@/components/expenses/InstallmentExpenseCard';
import { EmptyState } from '@/components/ui/empty-state';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { useWeddingPlan } from '@/features/wedding/WeddingPlanContext';

export default function HomePage() {
  const { weddingPlan, isLoading } = useWeddingPlan();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-8 text-muted-foreground">Memuat...</div>;
  }

  const expenses = weddingPlan?.expenses ?? [];
  const summary = weddingPlan?.summary;
  const hasExpenses = expenses.length > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Expense Hub</h1>
        {/* Desktop: inline button. Mobile: replaced by the FAB below. */}
        <Button onClick={() => setIsAddOpen(true)} className="hidden sm:inline-flex">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </div>

      <MasterBudgetBar
        totalBudget={weddingPlan?.totalBudget ?? 0}
        totalExpenses={summary?.totalExpenses ?? 0}
        totalPaid={summary?.totalPaid ?? 0}
      />

      {hasExpenses ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {expenses.map((exp) => (
            <Link
              key={exp.id}
              to={`/expenses/${exp.id}`}
              className="block rounded-xl transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {exp.type === 'one-time' ? (
                <OneTimeExpenseCard expense={exp} />
              ) : (
                <InstallmentExpenseCard expense={exp} />
              )}
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={PartyPopper}
          title="Mulai tambahkan pengeluaran pertamamu"
          description="Anggaran pernikahanmu sudah siap! Klik tombol di atas untuk memulai."
          action={<Button onClick={() => setIsAddOpen(true)}>Tambah Pengeluaran</Button>}
        />
      )}

      <AddExpenseModal isOpen={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* Mobile FAB — primary action always within thumb reach. Hidden on desktop. */}
      <Button
        onClick={() => setIsAddOpen(true)}
        aria-label="Tambah Pengeluaran"
        className="fixed bottom-6 right-6 z-30 size-14 rounded-full p-0 shadow-lg sm:hidden"
      >
        <Plus className="size-6" />
      </Button>
    </div>
  );
}
