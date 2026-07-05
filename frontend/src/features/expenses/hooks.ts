import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExpense as apiCreateExpense,
  updateExpense as apiUpdateExpense,
  deleteExpense as apiDeleteExpense,
  setOneTimeExpenseStatus as apiSetOneTimeStatus,
} from "./api";
import { toast } from "sonner";
import type { CreateExpensePayload, Expense, WeddingPlan } from "@/types/domain";

const PLAN_KEY = ["wedding-plan", "wp_sejati_v1"];

/**
 * Re-derives budget figures from expenses — mirror of the server's computeSummary,
 * so optimistic cache patches show the same numbers as the eventual refetch.
 */
function recomputeSummary(totalBudget: number, expenses: Expense[]) {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalPaid = expenses.reduce((sum, e) => {
    if (e.type === "one-time") return e.paymentStatus === "PAID" ? sum + e.totalAmount : sum;
    const paid = e.paymentTerms.filter((t) => t.status === "PAID").reduce((s, t) => s + t.amount, 0);
    return sum + paid;
  }, 0);
  return {
    totalExpenses,
    totalPaid,
    remainingBalance: totalBudget - totalExpenses,
    completionPercentage: totalExpenses > 0 ? Math.round((totalPaid / totalExpenses) * 100) : 0,
  };
}

/**
 * Central invalidation helper. Everything the user sees (To-Do, Budget,
 * MasterBudgetBar, expense cards) is DERIVED from the wedding-plan query,
 * so invalidating it once re-derives the entire app state consistently.
 */
function useInvalidatePlan() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["wedding-plan"] });
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
  };
}

export function useCreateExpense() {
  const invalidate = useInvalidatePlan();

  return useMutation({
    mutationFn: (newExpense: CreateExpensePayload) => apiCreateExpense(newExpense),
    onSuccess: () => {
      toast.success("Pengeluaran baru berhasil ditambahkan!");
      invalidate();
    },
    onError: (error) => {
      toast.error("Gagal menambahkan pengeluaran", {
        description: error.message,
      });
    },
  });
}

export function useUpdateExpense() {
  const invalidate = useInvalidatePlan();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<Expense, 'name' | 'categoryId' | 'notes'>> }) =>
      apiUpdateExpense(id, patch),
    onSuccess: () => {
      toast.success("Pengeluaran diperbarui.");
      invalidate();
    },
    onError: (error) => {
      toast.error("Gagal memperbarui pengeluaran", { description: error.message });
    },
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidatePlan();

  return useMutation({
    mutationFn: (id: string) => apiDeleteExpense(id),
    onSuccess: () => {
      // Deleting an expense automatically removes its derived tasks & budget
      // allocation — no ghost data.
      toast.success("Pengeluaran dihapus. Tugas & alokasi budget ikut dibersihkan.");
      invalidate();
    },
    onError: (error) => {
      toast.error("Gagal menghapus pengeluaran", { description: error.message });
    },
  });
}

export function useToggleOneTimeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, status }: { expenseId: string; status: 'PAID' | 'UNPAID' }) =>
      apiSetOneTimeStatus(expenseId, status),

    // Optimistic: patch the cache instantly so the Detail page reacts immediately.
    onMutate: async ({ expenseId, status }) => {
      await queryClient.cancelQueries({ queryKey: PLAN_KEY });
      const previous = queryClient.getQueryData<WeddingPlan>(PLAN_KEY);
      queryClient.setQueryData<WeddingPlan>(PLAN_KEY, (old) => {
        if (!old) return old;
        const expenses = old.expenses.map((e): Expense =>
          e.id === expenseId && e.type === 'one-time' ? { ...e, paymentStatus: status } : e,
        );
        return { ...old, expenses, summary: recomputeSummary(old.totalBudget, expenses) };
      });
      return { previous };
    },

    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'PAID'
          ? 'Pembayaran ditandai lunas!'
          : 'Status pembayaran dibatalkan.'
      );
    },

    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(PLAN_KEY, context.previous);
      toast.error("Gagal memperbarui status", { description: error.message });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wedding-plan"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
