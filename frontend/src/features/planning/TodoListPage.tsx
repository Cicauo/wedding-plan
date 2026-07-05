import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, CreditCard, Loader2, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import { celebrate } from '@/lib/celebration';
import { StatusPill } from '@/components/wedding/status-pill';
import { EXPENSE_CATEGORIES } from '@/types/domain';
import type { PaymentTask } from '@/types/domain';
import { usePaymentTasks, useToggleTaskDone } from './hooks';

function PaymentTaskItem({ task }: { task: PaymentTask }) {
  const navigate = useNavigate();
  const toggleMutation = useToggleTaskDone();
  const category = EXPENSE_CATEGORIES.find((c) => c.id === task.categoryId);

  // Read-only, auto-generated title per Phase 2 spec:
  //   "Bayar [Nama Termin] - [Nama Pengeluaran]"  (installment)
  //   "Bayar [Nama Pengeluaran]"                   (one-time)
  const title = task.termName
    ? `Bayar ${task.termName} - ${task.expenseName}`
    : `Bayar ${task.expenseName}`;

  const handlePay = () => {
    toggleMutation.mutate(
      { expenseId: task.expenseId, termId: task.id, status: 'PAID' },
      { onSuccess: () => celebrate() }
    );
  };

  return (
    <Card className={task.isOverdue ? 'border-destructive/50' : ''}>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
          <CreditCard className="size-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{category?.name || 'Lain-lain'}</span>
            <StatusPill status="UNPAID" dueDate={task.dueDate} />
          </div>
        </div>

        <p className="text-lg font-bold tabular-nums text-foreground sm:mr-2">
          {formatCurrency(task.amount)}
        </p>

        <div className="flex items-center gap-1.5">
          <Button type="button" size="sm" onClick={handlePay} disabled={toggleMutation.isPending}>
            {toggleMutation.isPending ? <Loader2 className="animate-spin" /> : <Check />}
            Tandai Lunas
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => navigate(`/expenses/${task.expenseId}`)}>
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TodoListPage() {
  const navigate = useNavigate();
  const { tasks, isLoading, isError, refetch } = usePaymentTasks();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Gagal memuat tugas"
          description="Ada masalah saat mengambil data pembayaran."
          action={<Button onClick={() => refetch()}>Coba lagi</Button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Daftar Pembayaran</h1>
        <p className="text-sm text-muted-foreground">
          Semua tagihan yang belum lunas dari seluruh item pengeluaranmu.
        </p>
      </header>

      {(tasks?.length ?? 0) === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Semua tenang. Belum ada pembayaran yang perlu diurus."
          description="Kamu sedang di jalur yang benar. Setiap tagihan baru akan otomatis muncul di sini."
          action={<Button onClick={() => navigate('/')}>Kembali ke Home</Button>}
        />
      ) : (
        <div className="space-y-4">
          {tasks!.map((t) => (
            <PaymentTaskItem key={t.id} task={t} />
          ))}
        </div>
      )}
    </div>
  );
}
