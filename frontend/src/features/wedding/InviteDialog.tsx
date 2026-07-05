import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field-error'
import { useInviteToPlan } from './hooks'

interface InviteDialogProps {
  weddingPlanId?: string
}

export function InviteDialog({ weddingPlanId }: InviteDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const invite = useInviteToPlan(weddingPlanId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    invite.mutate(
      { email },
      {
        onSuccess: () => {
          setEmail('')
          setOpen(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus /> Undang Pasangan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Undang Pasangan</DialogTitle>
          <DialogDescription>
            Pasanganmu dapat akses penuh ke wedding plan ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="email pasangan"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          {invite.error && <FieldError message={invite.error.message} />}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? 'Mengundang...' : 'Undang'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
