import { useState } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputCurrency } from '@/components/ui/input-currency'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { DatePicker } from '@/components/ui/date-picker'
import { useCurrentUser } from '@/features/auth/hooks'
import { useCreateWeddingPlan } from './hooks'

export default function OnboardingSetupPage() {
  useCurrentUser()
  const create = useCreateWeddingPlan()
  const [name, setName] = useState('')
  const [weddingDate, setWeddingDate] = useState<Date>()
  const [totalBudget, setTotalBudget] = useState(0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create.mutate({
      name,
      totalBudget,
      weddingDate: weddingDate?.toISOString().slice(0, 10),
    })
  }

  const isFormValid = name.trim() !== '' && totalBudget > 0 && !!weddingDate

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-cal text-3xl font-bold tracking-tight">
            Mari kita mulai rencanakan pernikahan impianmu.
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Cukup tiga langkah untuk memulai.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="space-y-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nama Pernikahan</Label>
              <Input
                id="plan-name"
                placeholder="Pernikahan Dita & Fakhri"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wedding-date">Tanggal Pernikahan</Label>
                <DatePicker
                  value={weddingDate}
                  onChange={setWeddingDate}
                  placeholder="Pilih tanggal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total-budget">Total Anggaran</Label>
                <InputCurrency
                  id="total-budget"
                  value={totalBudget}
                  onValueChange={setTotalBudget}
                  placeholder="50.000.000"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            {create.error && <FieldError message={create.error.message} />}

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || create.isPending}
            >
              {create.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <Heart className="mr-2" />
                  Lanjutkan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
