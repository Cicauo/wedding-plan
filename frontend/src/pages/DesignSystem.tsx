import { useMemo, useState } from 'react'
import { PartyPopper, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { StatusPill } from '@/components/wedding/status-pill'
import { CurrencyInput } from '@/components/wedding/currency-input'
import { PaymentProgressBar } from '@/components/wedding/payment-progress-bar'
import { VendorCard } from '@/components/wedding/vendor-card'
import { EmptyState } from '@/components/wedding/empty-state'
import { MOCK_PAYMENT_TERMS, MOCK_VENDORS } from '@/lib/mock-data'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABELS,
  computeVendorProgress,
} from '@/types/domain'

/**
 * DesignSystem — living showcase of Phase 0 primitives.
 * Not a product screen; a visual/manual QA surface for the
 * component library. Safe to delete once Storybook lands.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function DesignSystem() {
  const [amount, setAmount] = useState(15_000_000)
  const [date, setDate] = useState<Date | undefined>()
  const [category, setCategory] = useState<string>()

  const vendors = useMemo(
    () => MOCK_VENDORS.map((v) => computeVendorProgress(v, MOCK_PAYMENT_TERMS)),
    [],
  )

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Design System</h1>
        <p className="mt-1 text-muted-foreground">
          Phase 0 — Foundation & Component Library
        </p>
      </header>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Simpan</Button>
          <Button variant="secondary">Batal</Button>
          <Button variant="destructive">Hapus</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section title="Status Pills">
        <div className="flex flex-wrap gap-3">
          <StatusPill status="PAID" />
          <StatusPill status="UNPAID" />
          <StatusPill status="OVERDUE" />
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid max-w-md gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Vendor</Label>
            <Input id="name" placeholder="mis. The Grand Ballroom" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Total Kontrak</Label>
            <CurrencyInput id="amount" value={amount} onValueChange={setAmount} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cat">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="cat">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {VENDOR_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {VENDOR_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due">Tanggal Jatuh Tempo</Label>
            <DatePicker id="due" value={date} onChange={setDate} fromDate={new Date()} />
          </div>
        </div>
      </Section>

      <Section title="Payment Progress Bar">
        <div className="max-w-md space-y-6">
          <PaymentProgressBar paid={75_000_000} total={75_000_000} />
          <PaymentProgressBar paid={20_000_000} total={40_000_000} hasOverdue />
          <PaymentProgressBar paid={0} total={18_000_000} />
        </div>
      </Section>

      <Section title="Modal (Tambah Vendor)">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus /> Tambah Vendor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Vendor</DialogTitle>
              <DialogDescription>
                Masukkan detail vendor dan nilai kontraknya.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-name">Nama</Label>
                <Input id="m-name" placeholder="Nama vendor" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-total">Total Kontrak</Label>
                <CurrencyInput id="m-total" value={amount} onValueChange={setAmount} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Batal</Button>
              </DialogClose>
              <Button>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section title="Vendor Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          {vendors.map((v) => (
            <VendorCard key={v.id} vendor={v} onClick={() => {}} />
          ))}
        </div>
      </Section>

      <Section title="Empty State">
        <EmptyState
          icon={PartyPopper}
          title="Belum ada vendor"
          description="Mulai dengan menambahkan vendor pertama untuk pernikahanmu."
          action={
            <Button>
              <Plus /> Tambah Vendor
            </Button>
          }
        />
      </Section>
    </div>
  )
}
