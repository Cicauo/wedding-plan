import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deriveBudget,
  derivePaymentTasks,
  type BudgetSummary,
  type PaymentTask,
} from '@/types/domain'
import { listPaymentTerms, listVendors, setPaymentTermStatus } from '@/features/vendors/api'

/**
 * Shared query keys — MUST match the vendor feature's keys so all
 * modules read the same cache. This is what makes Phase 2 "magic"
 * work: To-Do, Budget, and Vendor Detail are all windows onto the
 * same two queries. Invalidate once, every view updates.
 */
const KEYS = {
  vendors: ['vendors'] as const,
  paymentTerms: ['payment-terms'] as const,
}

function useVendorsAndTerms() {
  const vendorsQuery = useQuery({ queryKey: KEYS.vendors, queryFn: listVendors })
  const termsQuery = useQuery({ queryKey: KEYS.paymentTerms, queryFn: listPaymentTerms })
  return {
    vendors: vendorsQuery.data,
    terms: termsQuery.data,
    isLoading: vendorsQuery.isLoading || termsQuery.isLoading,
    isError: vendorsQuery.isError || termsQuery.isError,
    refetch: () => {
      vendorsQuery.refetch()
      termsQuery.refetch()
    },
  }
}

// ------------------------------------------------------------
// To-Do List (derived payment tasks)
// ------------------------------------------------------------

/**
 * usePaymentTasks — the To-Do list, DERIVED from vendors + terms.
 * Never stored. Marking a task done flips the underlying
 * PaymentTerm.status via the SAME mutation used on the vendor
 * detail page, so status stays consistent everywhere.
 */
export function usePaymentTasks() {
  const { vendors, terms, isLoading, isError, refetch } = useVendorsAndTerms()

  const tasks: PaymentTask[] | undefined =
    vendors && terms ? derivePaymentTasks(vendors, terms) : undefined

  return { tasks, isLoading, isError, refetch }
}

/**
 * useToggleTaskDone — mark a payment task done/undone. This is the
 * cross-module two-way sync: it calls setPaymentTermStatus (single
 * source of truth) and invalidates the shared queries so the vendor
 * detail summary, progress bar, and budget all update at once.
 */
export function useToggleTaskDone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ termId, done }: { termId: string; done: boolean }) =>
      setPaymentTermStatus(termId, done ? 'PAID' : 'UNPAID'),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: KEYS.vendors }),
        qc.invalidateQueries({ queryKey: KEYS.paymentTerms }),
      ])
    },
  })
}

// ------------------------------------------------------------
// Budget Planner (derived planned vs actual)
// ------------------------------------------------------------

/**
 * useBudget — Budget Planner view, DERIVED from vendors + terms.
 * Planned = SUM(vendor contracts) per category (auto-added when a
 * vendor is created). Actual = SUM(paid terms) per category.
 */
export function useBudget() {
  const { vendors, terms, isLoading, isError, refetch } = useVendorsAndTerms()

  const budget: BudgetSummary | undefined =
    vendors && terms ? deriveBudget(vendors, terms) : undefined

  return { budget, isLoading, isError, refetch }
}
