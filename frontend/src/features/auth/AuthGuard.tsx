import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/features/auth/hooks'
import { AppNav } from '@/components/wedding/AppNav'
import { Toaster } from '@/components/ui/sonner'

/**
 * Route guard + protected layout: redirects unauthenticated users to /login,
 * and renders the persistent app chrome (nav + toaster) around every
 * protected route via <Outlet />.
 */
export function AuthGuard() {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return (
    <>
      <AppNav />
      <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 3_000 }} />
      <Outlet />
    </>
  )
}
