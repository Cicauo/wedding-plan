import { useState } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Check, Loader2, Pencil, Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusPill } from '@/components/wedding/status-pill'
import { formatRupiah } from '@/lib/currency'
import { celebratePaid, celebrateUndone } from '@/lib/celebration'
import { derivePaymentStatus, deriveUrgency, type PaymentTerm } from '@/types/domain'
import { useDeletePaymentTerm, useSetPaymentTermStatus } from './hooks'
import { EditPaymentTermDialog } from './EditPaymentTermDialog'

interface PaymentTermRowProps {
  term: PaymentTerm
  vendorName: string
}

/**
 * PaymentTermRow — one line in the payment schedule.
 * Shows name · due date · amount · status pill (with urgency
 * countdown), plus actions:
 * [Tandai Lunas] (or Batalkan), edit, delete. All mutations
 * recalc the header summary automatically via cache invalidation.
 */
export function PaymentTermRow({ term, vendorName }: PaymentTermRowProps) {
  const status = derivePaymentStatus(term)
  const urgency = deriveUrgency(term)
  const isPaid = term.status === 'PAID'
  const setStatus = useSetPaymentTermStatus()
  const deleteTerm = useDeletePaymentTerm()
  const [editOpen, setEditOpen] = useState(false)

  const togglePaid = () => {
    const willBePaid = !isPaid
    setStatus.mutate(
      { id: term.id, status: isPaid ? 'UNPAID' : 'PAID' },
      {
        onSuccess: () => {
          if (willBePaid) {
            celebratePaid(term.name, vendorName, term.amount)
          } else {
            celebrateUndone(term.name, vendorName)
          }
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-foreground">{term.name}</p>
          <StatusPill status={urgency.level !== 'none' && !isPaid ? urgency.level : status} />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Jatuh tempo {format(new Date(term.dueDate), 'd MMM yyyy', { locale: idLocale })}
          {!isPaid && urgency.label && (
            <span
              className={
                'ml-1.5 font-medium ' +
                (urgency.level === 'overdue'
                  ? 'text-status-overdue-subtle-foreground'
                  : urgency.level === 'soon'
                    ? 'text-orange-600'
                    : 'text-muted-foreground')
              }
            >
              · {urgency.label}
            </span>
          )}
        </p>
      </div>

      {/* Amount */}
      <p className="text-lg font-semibold tabular-nums text-foreground sm:mr-2">
        {formatRupiah(term.amount)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={isPaid ? 'secondary' : 'primary'}
          onClick={togglePaid}
          disabled={setStatus.isPending}
        >
          {setStatus.isPending ? (
            <Loader2 className="animate-spin" />
          ) : isPaid ? (
            <Undo2 />
          ) : (
            <Check />
          )}
          {isPaid ? 'Batalkan' : 'Tandai Lunas'}
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setEditOpen(true)}
          aria-label={`Edit ${term.name}`}
        >
          <Pencil />
        </Button>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => deleteTerm.mutate(term.id)}
          disabled={deleteTerm.isPending}
          aria-label={`Hapus ${term.name}`}
          className="text-muted-foreground hover:text-destructive"
        >
          {deleteTerm.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </div>

      <EditPaymentTermDialog term={term} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  )
}
