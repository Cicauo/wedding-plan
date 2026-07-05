import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, LogIn, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/ui/field-error'
import { useLogin } from './hooks'

export default function LoginPage() {
  const login = useLogin()
  const [email, setEmail] = useState('superadmin@sejati-ai.com')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Heart className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Wedding Plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk untuk lanjut ngatur vendor pernikahanmu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {login.error && (
            <FieldError message={login.error.message} />
          )}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn />
            )}
            Masuk
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-primary underline-offset-2 hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
