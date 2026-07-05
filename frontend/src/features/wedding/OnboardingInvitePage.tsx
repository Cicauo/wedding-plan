import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldError } from '@/components/ui/field-error'
import { useInviteToPlan, useCurrentWeddingPlan } from './hooks'
import { isEmail } from '@/lib/utils'

export default function OnboardingInvitePage() {
  const navigate = useNavigate()
  const plan = useCurrentWeddingPlan()
  const invite = useInviteToPlan(plan?.id)
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    invite.mutate(
      { email },
      {
        onSuccess: () => navigate('/'),
      },
    )
  }

  const isFormValid = isEmail(email)

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary-foreground">
            <span className="text-3xl">🫶</span>
          </div>
          <h1 className="font-cal text-3xl font-bold tracking-tight">
            Perencanaan lebih ringan kalau berdua.
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Undang pasanganmu untuk mulai berkolaborasi.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-in fade-in slide-in-from-bottom-8 duration-500"
        >
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Email pasangan..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!isFormValid || invite.isPending}
            >
              {invite.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
            </Button>
          </div>
          {invite.error && <FieldError message={invite.error.message} className="mt-2 text-left" />}
        </form>

        <Link
          to="/"
          className="animate-in fade-in slide-in-from-bottom-12 inline-block text-sm text-muted-foreground underline-offset-4
           duration-500 hover:underline"
        >
          Lewati untuk sekarang
        </Link>
      </div>
    </div>
  )
}
