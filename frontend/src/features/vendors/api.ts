import type { PaymentTerm, StoredPaymentStatus, Vendor } from '@/types/domain'
import { MOCK_PAYMENT_TERMS, MOCK_VENDORS } from '@/lib/mock-data'
import type { VendorFormValues } from './schema'
import type { PaymentTermFormValues } from './term-schema'

/**
 * Vendor + PaymentTerm API layer.
 *
 * TODO(backend): replace this in-memory mock with real fetch calls.
 *   GET    /api/vendors                      -> listVendors()
 *   GET    /api/vendors/:id                  -> getVendor()
 *   POST   /api/vendors                      -> createVendor()
 *   DELETE /api/vendors/:id                  -> deleteVendor()
 *   GET    /api/payment-terms                -> listPaymentTerms()
 *   POST   /api/vendors/:id/payment-terms    -> createPaymentTerm()
 *   PATCH  /api/payment-terms/:id            -> updatePaymentTerm()
 *   PATCH  /api/payment-terms/:id/status     -> setPaymentTermStatus()
 *   DELETE /api/payment-terms/:id            -> deletePaymentTerm()
 * Signatures already match the intended REST contract, so only the
 * bodies change — callers (hooks) stay untouched.
 */

// In-memory store seeded from fixtures (module-scoped, survives re-renders).
let vendors: Vendor[] = [...MOCK_VENDORS]
let paymentTerms: PaymentTerm[] = [...MOCK_PAYMENT_TERMS]

/** Simulate network latency so loading states are exercised in dev. */
const LATENCY_MS = 350
const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))

const genId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

// ------------------------------------------------------------
// Vendors
// ------------------------------------------------------------

export async function listVendors(): Promise<Vendor[]> {
  return delay([...vendors])
}

export async function getVendor(id: string): Promise<Vendor> {
  const vendor = vendors.find((v) => v.id === id)
  if (!vendor) throw new Error('Vendor tidak ditemukan')
  return delay({ ...vendor })
}

export async function createVendor(input: VendorFormValues): Promise<Vendor> {
  const vendor: Vendor = {
    id: genId('v'),
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
  // Cascade: remove the vendor's terms too.
  paymentTerms = paymentTerms.filter((t) => t.vendorId !== id)
  return delay({ id })
}

// ------------------------------------------------------------
// Payment terms
// ------------------------------------------------------------

export async function listPaymentTerms(): Promise<PaymentTerm[]> {
  return delay([...paymentTerms])
}

export async function createPaymentTerm(
  vendorId: string,
  input: PaymentTermFormValues,
): Promise<PaymentTerm> {
  const term: PaymentTerm = {
    id: genId('t'),
    vendorId,
    name: input.name,
    amount: input.amount,
    dueDate: input.dueDate,
    status: 'UNPAID',
  }
  paymentTerms = [...paymentTerms, term]
  return delay(term)
}

export async function updatePaymentTerm(
  id: string,
  input: PaymentTermFormValues,
): Promise<PaymentTerm> {
  let updated: PaymentTerm | undefined
  paymentTerms = paymentTerms.map((t) => {
    if (t.id !== id) return t
    updated = { ...t, name: input.name, amount: input.amount, dueDate: input.dueDate }
    return updated
  })
  if (!updated) throw new Error('Termin tidak ditemukan')
  return delay(updated)
}

export async function setPaymentTermStatus(
  id: string,
  status: StoredPaymentStatus,
): Promise<PaymentTerm> {
  let updated: PaymentTerm | undefined
  paymentTerms = paymentTerms.map((t) => {
    if (t.id !== id) return t
    updated = { ...t, status }
    return updated
  })
  if (!updated) throw new Error('Termin tidak ditemukan')
  return delay(updated)
}

export async function deletePaymentTerm(id: string): Promise<{ id: string }> {
  paymentTerms = paymentTerms.filter((t) => t.id !== id)
  return delay({ id })
}
