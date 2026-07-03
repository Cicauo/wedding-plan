import { z } from 'zod'

/**
 * Payment term form schema — single source of truth for the
 * "Tambah/Edit Termin" form. Status is not part of the form
 * (new terms default to UNPAID; status changes go through the
 * dedicated "Tandai Lunas" action).
 */
export const paymentTermFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama pembayaran wajib diisi')
    .max(60, 'Nama terlalu panjang'),
  amount: z
    .number({ message: 'Jumlah wajib diisi' })
    .int('Jumlah harus bilangan bulat')
    .positive('Jumlah harus lebih dari 0'),
  dueDate: z
    .string()
    .min(1, 'Tanggal jatuh tempo wajib diisi'),
})

export type PaymentTermFormValues = z.infer<typeof paymentTermFormSchema>
