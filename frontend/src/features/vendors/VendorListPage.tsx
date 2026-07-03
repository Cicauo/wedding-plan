import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartyPopper, Search, Trash2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VendorCard } from '@/components/wedding/vendor-card'
import { EmptyState } from '@/components/wedding/empty-state'
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABELS,
  type VendorCategory,
} from '@/types/domain'
import { useVendorsWithProgress } from './hooks'
import { AddVendorDialog } from './AddVendorDialog'
import { DeleteVendorDialog } from './DeleteVendorDialog'

const ALL = 'all' as const

/** Skeleton grid shown while vendors load (perceived performance). */
function VendorGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function VendorListPage() {
  const { data: vendors, isLoading, isError, refetch } = useVendorsWithProgress()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<VendorCategory | typeof ALL>(ALL)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(
    null,
  )

  const filtered = useMemo(() => {
    if (!vendors) return []
    const q = search.trim().toLowerCase()
    return vendors.filter((v) => {
      const matchesSearch = !q || v.name.toLowerCase().includes(q)
      const matchesCategory = category === ALL || v.category === category
      return matchesSearch && matchesCategory
    })
  }, [vendors, search, category])

  const hasVendors = (vendors?.length ?? 0) > 0
  const isFiltering = search.trim() !== '' || category !== ALL

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendor</h1>
          <p className="text-sm text-muted-foreground">
            Kelola vendor dan progres pembayaran pernikahanmu.
          </p>
        </div>
        <AddVendorDialog />
      </div>

      {/* Filters — hidden until there's something to filter */}
      {hasVendors && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Cari vendor"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v as VendorCategory | typeof ALL)}
          >
            <SelectTrigger className="sm:w-52" aria-label="Filter kategori">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Kategori</SelectItem>
              {VENDOR_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {VENDOR_CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* States: loading -> error -> empty -> no-results -> grid */}
      {isLoading ? (
        <VendorGridSkeleton />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Gagal memuat vendor"
          description="Terjadi kesalahan saat mengambil data."
          action={<Button onClick={refetch}>Coba lagi</Button>}
        />
      ) : !hasVendors ? (
        <EmptyState
          icon={PartyPopper}
          title="Kelola semua vendormu di satu tempat."
          description="Pantau kontrak, jadwal pembayaran, dan sisa tagihan tiap vendor — semuanya dalam satu pandangan yang bikin tenang."
          action={<AddVendorDialog triggerLabel="Tambah Vendor Pertamamu" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Vendor tidak ditemukan"
          description="Coba ubah kata kunci atau filter kategori."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor) => (
            <div key={vendor.id} className="group relative">
              <VendorCard
                vendor={vendor}
                onClick={() => navigate(`/vendors/${vendor.id}`)}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteTarget({ id: vendor.id, name: vendor.name })
                }}
                className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                aria-label={`Hapus ${vendor.name}`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      {hasVendors && !isLoading && filtered.length > 0 && (
        <p className="mt-6 text-xs text-muted-foreground">
          Menampilkan {filtered.length}
          {isFiltering ? ` dari ${vendors!.length}` : ''} vendor.
        </p>
      )}

      <DeleteVendorDialog
        vendorId={deleteTarget?.id ?? null}
        vendorName={deleteTarget?.name}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      />
    </div>
  )
}
