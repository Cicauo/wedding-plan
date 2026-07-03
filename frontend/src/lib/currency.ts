import type { Rupiah } from '@/types/domain'

/**
 * Format an integer rupiah amount for display.
 * @example formatRupiah(15000000) => "Rp 15.000.000"
 */
export function formatRupiah(amount: Rupiah): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format without the currency symbol — for input fields.
 * @example formatRupiahBare(15000000) => "15.000.000"
 */
export function formatRupiahBare(amount: Rupiah): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

/**
 * Parse a user-typed currency string back to an integer.
 * Strips all non-digits, so "Rp 15.000.000" => 15000000.
 */
export function parseRupiah(input: string): Rupiah {
  const digits = input.replace(/\D/g, '')
  return digits ? Number.parseInt(digits, 10) : 0
}
