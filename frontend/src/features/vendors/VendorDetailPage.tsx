import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ArrowLeft, CalendarClock, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/wedding/empty-state'
import { PaymentProgressBar } from '@/components/wedding/payment-progress-bar'
import { formatRupiah } from '@/lib/currency'
import { VENDOR_CATEGORY_LABELS } from '@/types/domain'
import { useVendorDetail } from './hooks'
import { AddPaymentTermForm } from './AddPaymentTermForm'
import { PaymentTermRow } from './PaymentTermRow'

/** A single summary stat box in the financial header. */
function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'paid' | 'remaining'
}) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={
          'mt-1 text-xl font-bold tabular-nums ' +
          (accent === 'paid'
            ? 'text-status-paid-subtle-foreground'
            : accent === 'remaining'
              ? 'text-foreground'
              : 'text-foreground')
        }
      >
        {value}
      </p>
    </div>
  )
}

export default function VendorDetailPage() {
  const { vendorId = '' } = useParams()
  const navigate = useNavigate()
  const { vendor, terms, isLoading, isError, refetch } = useVendorDetail(vendorId)

  const pieData = useMemo(() => {
    if (!vendor) return []
    return [
      { name: 'Dibayar', value: vendor.paidAmount, fill: 'hsl(var(--status-paid))' },
      {
        name: 'Sisa',
        value: vendor.remainingAmount,
        fill: 'hsl(var(--muted))',
      },
    ]
  }, [vendor])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !vendor) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <EmptyState
          icon={AlertCircle}
          title="Vendor tidak ditemukan"
          description="Vendor ini mungkin sudah dihapus atau tautannya salah."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate('/vendors')}>
                Kembali
              </Button>
              <Button onClick={refetch}>Coba lagi</Button>
            </div>
          }
        />
      </div>
    )
  }

  const unscheduled = vendor.unscheduledAmount

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Back + title */}
      <button
        type="button"
        onClick={() => navigate('/vendors')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Semua Vendor
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{vendor.name}</h1>
        <p className="text-sm text-muted-foreground">
          {VENDOR_CATEGORY_LABELS[vendor.category]}
        </p>
      </div>

      {/* Financial summary header */}
      <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatBox label="Total Kontrak" value={formatRupiah(vendor.totalContract)} />
          <StatBox label="Sudah Dibayar" value={formatRupiah(vendor.paidAmount)} accent="paid" />
          <StatBox label="Sisa Tagihan" value={formatRupiah(vendor.remainingAmount)} accent="remaining" />
        </div>

        {/* Pie chart — visual proportion */}
        <Card className="flex items-center justify-center p-4 md:w-40">
          <div className="relative size-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={38}
                  outerRadius={54}
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold tabular-nums text-foreground">
                {Math.round(vendor.progress * 100)}%
              </span>
              <span className="text-[10px] text-muted-foreground">terbayar</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress bar (full width, mirrors card) */}
      <div className="mb-8">
        <PaymentProgressBar
          paid={vendor.paidAmount}
          total={vendor.totalContract}
          hasOverdue={vendor.hasOverdue}
        />
      </div>

      {/* Payment schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Jadwal Pembayaran</CardTitle>
          {/* Real-time unscheduled feedback — specific & friendly */}
          {unscheduled > 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-status-overdue-subtle-foreground">
              <CalendarClock className="size-4" />
              Total terjadwal masih kurang{' '}
              <strong className="tabular-nums">{formatRupiah(unscheduled)}</strong> dari nilai
              kontrak <strong className="tabular-nums">{formatRupiah(vendor.totalContract)}</strong>.
            </p>
          ) : unscheduled < 0 ? (
            <p className="flex items-center gap-1.5 text-sm text-status-overdue-subtle-foreground">
              <AlertCircle className="size-4" />
              Waduh, total termin melebihi kontrak{' '}
              <strong className="tabular-nums">{formatRupiah(vendor.totalContract)}</strong> sebesar{' '}
              <strong className="tabular-nums">{formatRupiah(Math.abs(unscheduled))}</strong>. Cek
              lagi yuk.
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm text-status-paid-subtle-foreground">
              ✅ Semua pembayaran sudah terjadwal rapi.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add term form */}
          <div className="rounded-[var(--radius)] border border-dashed border-border bg-muted/30 p-4">
            <AddPaymentTermForm
              vendorId={vendor.id}
              suggestedAmount={unscheduled > 0 ? unscheduled : undefined}
              remainingToSchedule={unscheduled > 0 ? unscheduled : 0}
              totalContract={vendor.totalContract}
            />
          </div>

          {/* Term list */}
          {terms.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-foreground">
                Yuk, atur jadwal pembayaran pertamamu. 💳
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tambahkan termin di form atas—tiap termin otomatis jadi tugas di To-Do.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {terms.map((term) => (
                <PaymentTermRow key={term.id} term={term} vendorName={vendor.name} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
