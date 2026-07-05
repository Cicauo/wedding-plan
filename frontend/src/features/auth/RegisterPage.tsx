import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, UserPlus, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { useRegister } from './hooks'

export default function RegisterPage() {
  const register = useRegister()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate({ name, email, password })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Buat Akun</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar dulu, yuk! Gratis.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {register.error && (
            <FieldError message={register.error.message} />
          )}

          <Button type="submit" className="w-full" disabled={register.isPending}>
            {register.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UserPlus />
            )}
            Daftar
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Udah punya akun?{' '}
          <Link to="/login" className="font-medium text-primary underline-offset-2 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
