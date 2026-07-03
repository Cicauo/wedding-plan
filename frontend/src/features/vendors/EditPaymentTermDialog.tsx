import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { DatePicker } from '@/components/ui/date-picker'
import { CurrencyInput } from '@/components/wedding/currency-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import type { PaymentTerm } from '@/types/domain'
import { useUpdatePaymentTerm } from './hooks'
import { paymentTermFormSchema, type PaymentTermFormValues } from './term-schema'

function toISODate(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

interface EditPaymentTermDialogProps {
  term: PaymentTerm
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** EditPaymentTermDialog — edit an existing term's name/amount/due date. */
export function EditPaymentTermDialog({
  term,
  open,
  onOpenChange,
}: EditPaymentTermDialogProps) {
  const updateTerm = useUpdatePaymentTerm()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PaymentTermFormValues>({
    resolver: zodResolver(paymentTermFormSchema),
    defaultValues: { name: term.name, amount: term.amount, dueDate: term.dueDate },
  })

  // Re-sync form when a different term is opened.
  useEffect(() => {
    if (open) reset({ name: term.name, amount: term.amount, dueDate: term.dueDate })
  }, [open, term, reset])

  const onSubmit = (values: PaymentTermFormValues) => {
    updateTerm.mutate(
      { id: term.id, values },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Termin</DialogTitle>
          <DialogDescription>Ubah detail termin pembayaran ini.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nama Pembayaran</Label>
            <Input id="edit-name" aria-invalid={!!errors.name} {...register('name')} />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-amount">Jumlah</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => (
                <CurrencyInput
                  id="edit-amount"
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={!!errors.amount}
                />
              )}
            />
            <FieldError message={errors.amount?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-due">Jatuh Tempo</Label>
            <Controller
              control={control}
              name="dueDate"
              render={({ field }) => (
                <DatePicker
                  id="edit-due"
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) => field.onChange(date ? toISODate(date) : '')}
                />
              )}
            />
            <FieldError message={errors.dueDate?.message} />
          </div>

          {updateTerm.isError && (
            <p className="text-sm text-destructive" role="alert">
              Gagal menyimpan. Coba lagi.
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={updateTerm.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateTerm.isPending}>
              {updateTerm.isPending && <Loader2 className="animate-spin" />}
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
