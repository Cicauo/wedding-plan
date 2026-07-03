import { z } from 'zod'
import { VENDOR_CATEGORIES } from '@/types/domain'

/**
 * Vendor form schema — single source of truth for the "Tambah Vendor"
 * form. The inferred type (`VendorFormValues`) drives React Hook Form,
 * so validation rules and TypeScript types never drift.
 */
export const vendorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama vendor wajib diisi')
    .max(100, 'Nama terlalu panjang (maks. 100 karakter)'),
  category: z.enum(VENDOR_CATEGORIES, {
    message: 'Pilih kategori vendor',
  }),
  totalContract: z
    .number({ message: 'Nilai kontrak wajib diisi' })
    .int('Nilai harus bilangan bulat')
    .positive('Nilai kontrak harus lebih dari 0'),
  contact: z
    .string()
    .trim()
    .max(50, 'Kontak terlalu panjang')
    .optional()
    .or(z.literal('')),
  contractUrl: z
    .string()
    .trim()
    .url('Format URL tidak valid')
    .optional()
    .or(z.literal('')),
})

export type VendorFormValues = z.infer<typeof vendorFormSchema>
