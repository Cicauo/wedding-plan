import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  computeVendorProgress,
  type PaymentTerm,
  type StoredPaymentStatus,
  type VendorWithProgress,
} from '@/types/domain'
import {
  createPaymentTerm,
  createVendor,
  deletePaymentTerm,
  deleteVendor,
  getVendor,
  listPaymentTerms,
  listVendors,
  setPaymentTermStatus,
  updatePaymentTerm,
} from './api'
import type { VendorFormValues } from './schema'
import type { PaymentTermFormValues } from './term-schema'

const KEYS = {
  vendors: ['vendors'] as const,
  vendor: (id: string) => ['vendors', id] as const,
  paymentTerms: ['payment-terms'] as const,
}

/** Invalidate everything that feeds a progress view. */
async function invalidateProgress(qc: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: KEYS.vendors }),
    qc.invalidateQueries({ queryKey: KEYS.paymentTerms }),
  ])
}

// ------------------------------------------------------------
// Vendor list (with derived progress)
// ------------------------------------------------------------

/**
 * useVendorsWithProgress — fetches vendors + payment terms and joins
 * them into progress views. Progress is DERIVED here (single source of
 * truth), never persisted. Both queries share the cache so a term
 * update recomputes progress automatically.
 */
export function useVendorsWithProgress() {
  const vendorsQuery = useQuery({
    queryKey: KEYS.vendors,
    queryFn: listVendors,
  })
  const termsQuery = useQuery({
    queryKey: KEYS.paymentTerms,
    queryFn: listPaymentTerms,
  })

  const data: VendorWithProgress[] | undefined =
    vendorsQuery.data && termsQuery.data
      ? vendorsQuery.data.map((v) => computeVendorProgress(v, termsQuery.data))
      : undefined

  return {
    data,
    isLoading: vendorsQuery.isLoading || termsQuery.isLoading,
    isError: vendorsQuery.isError || termsQuery.isError,
    refetch: () => {
      vendorsQuery.refetch()
      termsQuery.refetch()
    },
  }
}

// ------------------------------------------------------------
// Single vendor detail (with derived progress + its terms)
// ------------------------------------------------------------

/**
 * useVendorDetail — one vendor + its payment terms, joined into a
 * progress view. Terms are returned separately (sorted by due date)
 * for the schedule list. Recalc is automatic: any term mutation
 * invalidates the shared terms cache, re-deriving the summary.
 */
export function useVendorDetail(vendorId: string) {
  const vendorQuery = useQuery({
    queryKey: KEYS.vendor(vendorId),
    queryFn: () => getVendor(vendorId),
    enabled: !!vendorId,
  })
  const termsQuery = useQuery({
    queryKey: KEYS.paymentTerms,
    queryFn: listPaymentTerms,
  })

  const terms: PaymentTerm[] = (termsQuery.data ?? [])
    .filter((t) => t.vendorId === vendorId)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const vendor: VendorWithProgress | undefined =
    vendorQuery.data && termsQuery.data
      ? computeVendorProgress(vendorQuery.data, termsQuery.data)
      : undefined

  return {
    vendor,
    terms,
    isLoading: vendorQuery.isLoading || termsQuery.isLoading,
    isError: vendorQuery.isError || termsQuery.isError,
    refetch: () => {
      vendorQuery.refetch()
      termsQuery.refetch()
    },
  }
}

// ------------------------------------------------------------
// Vendor mutations
// ------------------------------------------------------------

export function useAddVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: VendorFormValues) => createVendor(values),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.vendors }),
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => invalidateProgress(qc),
  })
}

// ------------------------------------------------------------
// Payment term mutations — all invalidate progress for real-time recalc
// ------------------------------------------------------------

export function useAddPaymentTerm(vendorId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: PaymentTermFormValues) =>
      createPaymentTerm(vendorId, values),
    onSuccess: () => invalidateProgress(qc),
  })
}

export function useUpdatePaymentTerm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PaymentTermFormValues }) =>
      updatePaymentTerm(id, values),
    onSuccess: () => invalidateProgress(qc),
  })
}

export function useSetPaymentTermStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StoredPaymentStatus }) =>
      setPaymentTermStatus(id, status),
    onSuccess: () => invalidateProgress(qc),
  })
}

export function useDeletePaymentTerm() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePaymentTerm(id),
    onSuccess: () => invalidateProgress(qc),
  })
}
