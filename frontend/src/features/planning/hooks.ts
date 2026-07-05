import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useWeddingPlan } from '@/features/wedding/WeddingPlanContext';
import type { Expense, WeddingPlan } from '@/types/domain';
import { 
  type BudgetSummary, 
  type PaymentTask,
  deriveBudgetFromExpenses,
  deriveTasksFromExpenses
} from '@/types/domain-derivatives';
import { setPaymentTermStatus, setOneTimeExpenseStatus } from '@/features/expenses/api';
import { toast } from 'sonner';

// ============================================================
// DERIVED DATA HOOKS (for To-Do List & Budget Page)
// These hooks derive their data from the central `useWeddingPlan` context.
// ============================================================

/**
 * usePaymentTasks — Provides a list of all upcoming and overdue payments.
 * This is DERIVED from the `expenses` array in the current wedding plan.
 */
export function usePaymentTasks() {
  const { weddingPlan, isLoading, isError, refetch } = useWeddingPlan();

  const tasks: PaymentTask[] | undefined = weddingPlan
    ? deriveTasksFromExpenses(weddingPlan.expenses)
    : undefined;

  return { tasks, isLoading, isError, refetch };
}

/**
 * useBudget — Provides a summary of the budget status by category.
 * This is DERIVED from the `expenses` array in the current wedding plan.
 */
export function useBudget() {
  const { weddingPlan, isLoading, isError, refetch } = useWeddingPlan();

  const budget: BudgetSummary | undefined = weddingPlan
    ? deriveBudgetFromExpenses(weddingPlan.expenses, weddingPlan.totalBudget)
    : undefined;

  return { budget, isLoading, isError, refetch };
}


// ============================================================
// MUTATIONS
// ============================================================

/**
 * useToggleTaskDone — Marks a payment task as PAID or UNPAID.
 *
 * A "task" can back either a ONE-TIME expense (termId === expenseId, no real
 * term) or a single installment TERM. We look up the parent expense to route
 * to the correct API so one-time payments don't hit the installment-only path.
 *
 * OPTIMISTIC UI: onMutate patches the cached wedding-plan instantly (status +
 * re-derived summary) so the tap feels immediate. onError rolls back to the
 * snapshot; onSettled invalidates to reconcile with the server.
 */
export function useToggleTaskDone() {
  const queryClient = useQueryClient();
  const { weddingPlan } = useWeddingPlan();
  const queryKey = ['wedding-plan', 'wp_sejati_v1'];

  return useMutation({
    mutationFn: async ({ expenseId, termId, status }: { expenseId: string; termId: string; status: 'PAID' | 'UNPAID' }): Promise<void> => {
      const expense = weddingPlan?.expenses.find((e) => e.id === expenseId);
      if (expense?.type === 'one-time') {
        await setOneTimeExpenseStatus(expenseId, status);
        return;
      }
      await setPaymentTermStatus(expenseId, termId, status);
    },

    // Optimistic update — patch the cache before the server responds.
    onMutate: async ({ expenseId, termId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<WeddingPlan>(queryKey);

      queryClient.setQueryData<WeddingPlan>(queryKey, (old) => {
        if (!old) return old;
        const expenses = old.expenses.map((e): Expense => {
          if (e.id !== expenseId) return e;
          if (e.type === 'one-time') {
            return { ...e, paymentStatus: status };
          }
          return {
            ...e,
            paymentTerms: e.paymentTerms.map((t) =>
              t.id === termId ? { ...t, status } : t,
            ),
          };
        });
        return { ...old, expenses, summary: recomputeSummary(old.totalBudget, expenses) };
      });

      return { previous };
    },

    onError: (error, _vars, context) => {
      // Roll back to the pre-mutation snapshot.
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('Gagal memperbarui status pembayaran', {
        description: error.message,
      });
    },

    onSettled: () => {
      // Reconcile with the server regardless of outcome.
      queryClient.invalidateQueries({ queryKey: ['wedding-plan'] });
    },
  });
}

/**
 * Re-derives budget figures from expenses — mirror of the server's computeSummary,
 * kept in sync so optimistic updates show the same numbers as the eventual refetch.
 */
function recomputeSummary(totalBudget: number, expenses: Expense[]) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalPaid = expenses.reduce((sum, e) => {
    if (e.type === 'one-time') {
      return e.paymentStatus === 'PAID' ? sum + e.totalAmount : sum;
    }
    const paid = e.paymentTerms.filter((t) => t.status === 'PAID').reduce((s, t) => s + t.amount, 0);
    return sum + paid;
  }, 0);
  return {
    totalExpenses,
    totalPaid,
    remainingBalance: totalBudget - totalExpenses,
    completionPercentage: totalExpenses > 0 ? Math.round((totalPaid / totalExpenses) * 100) : 0,
  };
}
