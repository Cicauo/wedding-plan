import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDeleteVendor } from './hooks'

interface DeleteVendorDialogProps {
  vendorId: string | null
  vendorName?: string
  onOpenChange: (open: boolean) => void
}

/**
 * DeleteVendorDialog — destructive confirmation. Controlled by the
 * parent (open when `vendorId` is set). Closes on success.
 */
export function DeleteVendorDialog({
  vendorId,
  vendorName,
  onOpenChange,
}: DeleteVendorDialogProps) {
  const deleteVendor = useDeleteVendor()

  const handleConfirm = () => {
    if (!vendorId) return
    deleteVendor.mutate(vendorId, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={!!vendorId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus {vendorName ?? 'vendor'} ini?</DialogTitle>
          <DialogDescription>
            Semua termin pembayaran, tugas di To-Do, dan alokasi budget yang
            terkait vendor ini juga akan ikut terhapus. Tindakan ini tidak bisa
            dibatalkan.
          </DialogDescription>
        </DialogHeader>

        {deleteVendor.isError && (
          <p className="text-sm text-destructive" role="alert">
            Gagal menghapus. Coba lagi.
          </p>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={deleteVendor.isPending}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteVendor.isPending}
          >
            {deleteVendor.isPending && <Loader2 className="animate-spin" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
