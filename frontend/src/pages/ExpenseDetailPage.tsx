import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  ArrowLeft, Check, CreditCard, Loader2, Trash2, Undo2, AlertCircle, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusPill } from '@/components/wedding/status-pill';
import { formatCurrency } from '@/lib/utils';
import { celebrate } from '@/lib/celebration';
import { EXPENSE_CATEGORIES } from '@/types/domain';
import type { InstallmentExpense, OneTimeExpense, PaymentTerm } from '@/types/domain';
import { useWeddingPlan } from '@/features/wedding/WeddingPlanContext';
import { useDeleteExpense, useToggleOneTimeStatus } from '@/features/expenses/hooks';
import { useToggleTaskDone } from '@/features/planning/hooks';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

function isOverdue(iso: string, status: string) {
  return status === 'UNPAID' && new Date(iso) < new Date();
}

/** A single installment term row with its own Tandai Lunas / Batalkan control. */
function TermRow({ expenseId, term }: { expenseId: string; term: PaymentTerm }) {
  const toggle = useToggleTaskDone();
  const overdue = isOverdue(term.dueDate, term.status);

  const handleToggle = () => {
    const next = term.status === 'PAID' ? 'UNPAID' : 'PAID';
    toggle.mutate(
      { expenseId, termId: term.id, status: next },
      { onSuccess: () => next === 'PAID' && celebrate() },
    );
  };

  return (
    <div className="flex flex-col gap-3 border-b py-3 last:border-b-0 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{term.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          {format(new Date(term.dueDate), 'd MMM yyyy', { locale: idLocale })}
        </p>
      </div>
      <p className="font-bold tabular-nums text-foreground sm:mr-2">{formatCurrency(term.amount)}</p>
      <StatusPill status={term.status} isOverdue={overdue} />
      <Button
        size="sm"
        variant={term.status === 'PAID' ? 'outline' : 'primary'}
        onClick={handleToggle}
        disabled={toggle.isPending}
      >
        {toggle.isPending ? <Loader2 className="animate-spin" /> : term.status === 'PAID' ? <Undo2 /> : <Check />}
        {term.status === 'PAID' ? 'Batalkan' : 'Tandai Lunas'}
      </Button>
    </div>
  );
}

/** Payment control for one-time expenses. */
function OneTimePayment({ expense }: { expense: OneTimeExpense }) {
  const toggle = useToggleOneTimeStatus();
  const overdue = isOverdue(expense.dueDate, expense.paymentStatus);

  const handleToggle = () => {
    const next = expense.paymentStatus === 'PAID' ? 'UNPAID' : 'PAID';
    toggle.mutate(
      { expenseId: expense.id, status: next },
      { onSuccess: () => next === 'PAID' && celebrate() },
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5" />
          Jatuh tempo {format(new Date(expense.dueDate), 'd MMM yyyy', { locale: idLocale })}
        </p>
      </div>
      <StatusPill status={expense.paymentStatus} isOverdue={overdue} />
      <Button
        variant={expense.paymentStatus === 'PAID' ? 'outline' : 'primary'}
        onClick={handleToggle}
        disabled={toggle.isPending}
      >
        {toggle.isPending ? <Loader2 className="animate-spin" /> : expense.paymentStatus === 'PAID' ? <Undo2 /> : <Check />}
        {expense.paymentStatus === 'PAID' ? 'Batalkan Lunas' : 'Tandai Lunas'}
      </Button>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { weddingPlan, isLoading } = useWeddingPlan();
  const deleteExpense = useDeleteExpense();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const expense = weddingPlan?.expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Pengeluaran tidak ditemukan"
          description="Mungkin sudah dihapus atau tautannya tidak valid."
          action={<Button onClick={() => navigate('/')}>Kembali ke Home</Button>}
        />
      </div>
    );
  }

  const category = EXPENSE_CATEGORIES.find((c) => c.id === expense.categoryId);

  const handleDelete = () => {
    setDeleteConfirm(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-1 size-4" /> Kembali
      </Button>

      <div className="sticky top-0 z-20 -mx-6 mb-6 flex items-start justify-between gap-4 border-b bg-background/95 px-6 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
            <CreditCard className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{expense.name}</h1>
            <p className="text-sm text-muted-foreground">
              {category?.name || 'Lain-lain'} · {expense.type === 'installments' ? 'Bertahap' : 'Sekali Bayar'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleDelete} disabled={deleteExpense.isPending} aria-label="Hapus pengeluaran">
          {deleteExpense.isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="text-destructive" />}
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total</p>
            <p className="text-xl font-bold tabular-nums text-foreground">{formatCurrency(expense.totalAmount)}</p>
          </div>
          {expense.notes && (
            <div className="col-span-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Catatan</p>
              <p className="text-sm text-foreground">{expense.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          {expense.type === 'one-time' ? (
            <OneTimePayment expense={expense as OneTimeExpense} />
          ) : (
            <div>
              {(expense as InstallmentExpense).paymentTerms.map((term) => (
                <TermRow key={term.id} expenseId={expense.id} term={term} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog — replaces native window.confirm */}
      <Dialog open={deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(false)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Hapus pengeluaran?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">{expense.name}</span> akan dihapus beserta semua
              tugas & alokasi budget terkait. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirm(false);
                deleteExpense.mutate(expense.id, { onSuccess: () => navigate('/') });
              }}
              disabled={deleteExpense.isPending}
            >
              {deleteExpense.isPending ? <Loader2 className="animate-spin" /> : <Trash2 className="size-4" />}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
