import type { PaymentTerm, Vendor } from '@/types/domain'

/**
 * Mock fixtures for Phase 0 development.
 * TODO(backend): replace with API calls once endpoints land.
 *   GET /api/vendors           -> Vendor[]
 *   GET /api/payment-terms     -> PaymentTerm[]
 */

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'The Grand Ballroom',
    category: 'venue',
    totalContract: 75_000_000,
    contact: '0812-1111-2222',
    createdAt: '2026-01-10',
  },
  {
    id: 'v2',
    name: 'Sedap Catering',
    category: 'catering',
    totalContract: 40_000_000,
    contact: '0813-3333-4444',
    createdAt: '2026-01-12',
  },
  {
    id: 'v3',
    name: 'Momento Photography',
    category: 'photography',
    totalContract: 18_000_000,
    createdAt: '2026-01-15',
  },
]

export const MOCK_PAYMENT_TERMS: PaymentTerm[] = [
  // Venue — fully paid
  { id: 't1', vendorId: 'v1', name: 'DP', amount: 25_000_000, dueDate: '2026-02-01', status: 'PAID' },
  { id: 't2', vendorId: 'v1', name: 'Termin 2', amount: 25_000_000, dueDate: '2026-05-01', status: 'PAID' },
  { id: 't3', vendorId: 'v1', name: 'Pelunasan', amount: 25_000_000, dueDate: '2026-08-01', status: 'PAID' },
  // Catering — partially paid, one overdue (past date, unpaid)
  { id: 't4', vendorId: 'v2', name: 'DP', amount: 20_000_000, dueDate: '2026-02-15', status: 'PAID' },
  { id: 't5', vendorId: 'v2', name: 'Pelunasan', amount: 20_000_000, dueDate: '2026-01-01', status: 'UNPAID' },
  // Photography — nothing paid yet, all future
  { id: 't6', vendorId: 'v3', name: 'DP', amount: 9_000_000, dueDate: '2027-01-01', status: 'UNPAID' },
  { id: 't7', vendorId: 'v3', name: 'Pelunasan', amount: 9_000_000, dueDate: '2027-06-01', status: 'UNPAID' },
]
