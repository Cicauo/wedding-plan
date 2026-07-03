import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { DatePicker } from '@/components/ui/date-picker'
import { CurrencyInput } from '@/components/wedding/currency-input'
import { formatRupiah } from '@/lib/currency'
import { useAddPaymentTerm } from './hooks'
import { paymentTermFormSchema, type PaymentTermFormValues } from './term-schema'

/** Serialize a Date to a local ISO date (yyyy-mm-dd) without TZ drift. */
function toISODate(d: Date): string {
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

interface AddPaymentTermFormProps {
  vendorId: string
  /** Prefill amount — e.g. the remaining unscheduled amount. */
  suggestedAmount?: number
  /**
   * How much of the contract is still unscheduled (total − sum of
   * existing terms). Used for friendly, specific over-budget
   * validation on the amount the user is typing.
   */
  remainingToSchedule: number
  /** Total contract value — for the "melebihi kontrak" message. */
  totalContract: number
}

/**
 * AddPaymentTermForm — inline form to add a payment term on the
 * vendor detail page. RHF + Zod. Resets on success so the user can
 * add several terms in a row.
 *
 * Phase 3: friendly, specific inline validation. If the entered
 * amount would push scheduled terms OVER the contract value, we
 * guide instead of blame — showing exactly by how much and blocking
 * submit so bad data never reaches the store.
 */
export function AddPaymentTermForm({
  vendorId,
  suggestedAmount,
  remainingToSchedule,
  totalContract,
}: AddPaymentTermFormProps) {
  const addTerm = useAddPaymentTerm(vendorId)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<PaymentTermFormValues>({
    resolver: zodResolver(paymentTermFormSchema),
    defaultValues: { name: '', amount: 0, dueDate: '' },
  })

  // Live over-budget check as the user types the amount.
  const enteredAmount = watch('amount') || 0
  const overBy = enteredAmount - remainingToSchedule
  const isOverBudget = overBy > 0

  const onSubmit = (values: PaymentTermFormValues) => {
    // Guard: never let scheduled terms exceed the contract.
    if (values.amount > remainingToSchedule) return
    addTerm.mutate(values, {
      onSuccess: () => reset({ name: '', amount: 0, dueDate: '' }),
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start"
      noValidate
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="term-name">Nama Pembayaran</Label>
        <Input
          id="term-name"
          placeholder="mis. DP, Pelunasan"
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="term-amount">Jumlah</Label>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <CurrencyInput
              id="term-amount"
              value={field.value}
              onValueChange={field.onChange}
              placeholder={
                suggestedAmount ? `Rp ${suggestedAmount.toLocaleString('id-ID')}` : undefined
              }
              aria-invalid={!!errors.amount || isOverBudget}
            />
          )}
        />
        <FieldError message={errors.amount?.message} />
        {/* Friendly, specific over-budget guidance (inline, real-time) */}
        {!errors.amount && isOverBudget && (
          <p
            className="flex items-start gap-1.5 text-sm text-status-overdue-subtle-foreground"
            role="alert"
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Waduh, jumlah ini bikin total termin melebihi kontrak{' '}
              <strong className="tabular-nums">{formatRupiah(totalContract)}</strong> sebesar{' '}
              <strong className="tabular-nums">{formatRupiah(overBy)}</strong>. Cek lagi yuk.
            </span>
          </p>
        )}
      </div>

      {/* Due date */}
      <div className="space-y-1.5">
        <Label htmlFor="term-due">Jatuh Tempo</Label>
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DatePicker
              id="term-due"
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => field.onChange(date ? toISODate(date) : '')}
            />
          )}
        />
        <FieldError message={errors.dueDate?.message} />
      </div>

      {/* Submit */}
      <div className="space-y-1.5">
        <Label className="hidden sm:block sm:opacity-0">.</Label>
        <Button
          type="submit"
          disabled={addTerm.isPending || isOverBudget}
          className="w-full sm:w-auto"
        >
          {addTerm.isPending ? <Loader2 className="animate-spin" /> : <Plus />}
          Tambah
        </Button>
      </div>

      {addTerm.isError && (
        <p className="text-sm text-destructive sm:col-span-4" role="alert">
          Gagal menambah termin. Coba lagi.
        </p>
      )}
    </form>
  )
}
