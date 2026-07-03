import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import {
  AlertCircle,
  Check,
  CreditCard,
  Loader2,
  Undo2,
  ClipboardCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/wedding/empty-state'
import { StatusPill } from '@/components/wedding/status-pill'
import { formatRupiah } from '@/lib/currency'
import { VENDOR_CATEGORY_LABELS, type PaymentTask } from '@/types/domain'
import { usePaymentTasks, useToggleTaskDone } from './hooks'

function PaymentTaskItem({ task }: { task: PaymentTask }) {
  const navigate = useNavigate()
  const toggle = useToggleTaskDone()

  return (
    <Card
      className={
        'transition-colors ' +
        (task.done ? 'opacity-60' : task.isOverdue ? 'border-status-overdue/40' : '')
      }
    >
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        {/* Payment icon — signals this is a payment task, not a generic todo */}
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-status-paid-subtle text-status-paid-subtle-foreground"
          aria-hidden
        >
          <CreditCard className="size-5" />
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={
                'font-medium ' +
                (task.done ? 'text-muted-foreground line-through' : 'text-foreground')
              }
            >
              {task.title}
            </p>
            <StatusPill status={task.status} />
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {VENDOR_CATEGORY_LABELS[task.category]} · Jatuh tempo{' '}
            {format(new Date(task.dueDate), 'd MMM yyyy', { locale: idLocale })}
          </p>
        </div>

        {/* Amount — highlighted commitment */}
        <p className="text-lg font-bold tabular-nums text-foreground sm:mr-2">
          {formatRupiah(task.amount)}
        </p>

        {/* Action: mark done / undo. NON-editable amount/date — source of
            truth is the vendor detail page (open via the vendor link). */}
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={task.done ? 'secondary' : 'primary'}
            onClick={() => toggle.mutate({ termId: task.termId, done: !task.done })}
            disabled={toggle.isPending}
          >
            {toggle.isPending ? (
              <Loader2 className="animate-spin" />
            ) : task.done ? (
              <Undo2 />
            ) : (
              <Check />
            )}
            {task.done ? 'Batalkan' : 'Tandai Lunas'}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/vendors/${task.vendorId}`)}
          >
            Detail
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TodoListPage() {
  const { tasks, isLoading, isError, refetch } = usePaymentTasks()

  const { pending, done } = useMemo(() => {
    const p: PaymentTask[] = []
    const d: PaymentTask[] = []
    for (const t of tasks ?? []) (t.done ? d : p).push(t)
    return { pending: p, done: d }
  }, [tasks])

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">To-Do</h1>
        <p className="text-sm text-muted-foreground">
          Tugas pembayaran otomatis dari vendormu. Tandai lunas di sini atau di
          Detail Vendor—statusnya selalu sinkron.
        </p>
      </header>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Gagal memuat tugas"
          description="Ada masalah saat mengambil data pembayaran."
          action={<Button onClick={refetch}>Coba lagi</Button>}
        />
      ) : (tasks?.length ?? 0) === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Belum ada tugas pembayaran"
          description="Tambahkan termin pembayaran di Detail Vendor—tiap termin otomatis muncul di sini sebagai tugas."
        />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Belum lunas ({pending.length})
              </h2>
              {pending.map((t) => (
                <PaymentTaskItem key={t.termId} task={t} />
              ))}
            </section>
          )}

          {done.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Selesai ({done.length})
              </h2>
              {done.map((t) => (
                <PaymentTaskItem key={t.termId} task={t} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  )
}
