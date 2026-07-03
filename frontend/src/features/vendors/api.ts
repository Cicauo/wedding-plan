import type { PaymentTerm, Vendor } from '@/types/domain'
import { MOCK_PAYMENT_TERMS, MOCK_VENDORS } from '@/lib/mock-data'
import type { VendorFormValues } from './schema'

/**
 * Vendor API layer.
 *
 * TODO(backend): replace this in-memory mock with real fetch calls.
 *   GET    /api/vendors                 -> listVendors()
 *   POST   /api/vendors                 -> createVendor()
 *   DELETE /api/vendors/:id             -> deleteVendor()
 *   GET    /api/payment-terms           -> listPaymentTerms()
 * The signatures below already match the intended REST contract, so
 * only the bodies change — callers (hooks) stay untouched.
 */

// In-memory store seeded from fixtures (module-scoped, survives re-renders).
let vendors: Vendor[] = [...MOCK_VENDORS]
const paymentTerms: PaymentTerm[] = [...MOCK_PAYMENT_TERMS]

/** Simulate network latency so loading states are exercised in dev. */
const LATENCY_MS = 400
const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))

const genId = () =>
  `v_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export async function listVendors(): Promise<Vendor[]> {
  return delay([...vendors])
}

export async function listPaymentTerms(): Promise<PaymentTerm[]> {
  return delay([...paymentTerms])
}

export async function createVendor(input: VendorFormValues): Promise<Vendor> {
  const vendor: Vendor = {
    id: genId(),
    name: input.name,
    category: input.category,
    totalContract: input.totalContract,
    contact: input.contact || undefined,
    contractUrl: input.contractUrl || undefined,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  vendors = [vendor, ...vendors]
  return delay(vendor)
}

export async function deleteVendor(id: string): Promise<{ id: string }> {
  vendors = vendors.filter((v) => v.id !== id)
  return delay({ id })
}
