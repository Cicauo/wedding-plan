import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
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
import { CurrencyInput } from '@/components/wedding/currency-input'
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS } from '@/types/domain'
import { useAddVendor } from './hooks'
import { vendorFormSchema, type VendorFormValues } from './schema'

/**
 * AddVendorDialog — "Tambah Vendor" form in a modal.
 * RHF + Zod (shared schema). Handles validation, submit loading,
 * and closes + resets on success. CurrencyInput/Select are
 * controlled via RHF Controller.
 */
export function AddVendorDialog({
  triggerLabel = 'Tambah Vendor',
}: {
  triggerLabel?: string
}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const addVendor = useAddVendor()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      category: undefined,
      totalContract: 0,
      contact: '',
      contractUrl: '',
    },
  })

  const onSubmit = (values: VendorFormValues) => {
    addVendor.mutate(values, {
      onSuccess: (created) => {
        reset()
        setOpen(false)
        // Progressive disclosure: drop the user straight into the
        // detail page to set up payment terms.
        navigate(`/vendors/${created.id}`)
      },
    })
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Vendor</DialogTitle>
          <DialogDescription>
            Masukkan detail vendor dan nilai kontraknya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Vendor</Label>
            <Input
              id="name"
              placeholder="mis. The Grand Ballroom"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="category" aria-invalid={!!errors.category}>
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
              )}
            />
            <FieldError message={errors.category?.message} />
          </div>

          {/* Total contract */}
          <div className="space-y-1.5">
            <Label htmlFor="totalContract">Total Kontrak</Label>
            <Controller
              control={control}
              name="totalContract"
              render={({ field }) => (
                <CurrencyInput
                  id="totalContract"
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-invalid={!!errors.totalContract}
                />
              )}
            />
            <FieldError message={errors.totalContract?.message} />
          </div>

          {/* Contact (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="contact">
              Kontak <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <Input id="contact" placeholder="No. HP / email" {...register('contact')} />
            <FieldError message={errors.contact?.message} />
          </div>

          {/* Contract URL (optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="contractUrl">
              Link Kontrak <span className="text-muted-foreground">(opsional)</span>
            </Label>
            <Input
              id="contractUrl"
              placeholder="https://..."
              aria-invalid={!!errors.contractUrl}
              {...register('contractUrl')}
            />
            <FieldError message={errors.contractUrl?.message} />
          </div>

          {addVendor.isError && (
            <p className="text-sm text-destructive" role="alert">
              Gagal menyimpan vendor. Coba lagi.
            </p>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={addVendor.isPending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={addVendor.isPending}>
              {addVendor.isPending && <Loader2 className="animate-spin" />}
              Simpan & Atur Pembayaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
