import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { computeVendorProgress, type VendorWithProgress } from '@/types/domain'
import { createVendor, deleteVendor, listPaymentTerms, listVendors } from './api'
import type { VendorFormValues } from './schema'

const KEYS = {
  vendors: ['vendors'] as const,
  paymentTerms: ['payment-terms'] as const,
}

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

export function useAddVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (values: VendorFormValues) => createVendor(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.vendors })
    },
  })
}

export function useDeleteVendor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteVendor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.vendors })
    },
  })
}
