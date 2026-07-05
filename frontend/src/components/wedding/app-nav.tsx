import { CreditCard, LayoutGrid, LogOut, Store, UserPlus, Wallet } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Avatar } from '@/components/wedding/avatar'
import { useCurrentUser, useLogout } from '@/features/auth/hooks'
import { useCurrentWeddingPlan, usePlanMembers } from '@/features/wedding/hooks'
import { InviteDialog } from '@/features/wedding/InviteDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const LINKS = [
  { to: '/vendors', label: 'Vendor', icon: Store },
  { to: '/todos', label: 'To-Do', icon: CreditCard },
  { to: '/budget', label: 'Budget', icon: Wallet },
]

export function AppNav() {
  const { data: user } = useCurrentUser()
  const plan = useCurrentWeddingPlan()
  const { data: members } = usePlanMembers(plan?.id)
  const logout = useLogout()
  const navigate = useNavigate()

  // No user → no nav
  if (!user) return null

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2 font-semibold">
          <LayoutGrid className="size-5 text-primary" />
          <span className="hidden sm:inline">{plan?.name ?? 'Wedding Plan'}</span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex flex-1 items-center gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {plan && (
            <InviteDialog weddingPlanId={plan.id} />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar user={user} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                {plan && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.name}
                    {members && members.length > 1 && ` · ${members.length} anggota`}
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              {plan && (
                <DropdownMenuItem onClick={() => navigate('/plan')}>
                  <UserPlus className="mr-2 size-4" />
                  Kelola Plan
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
              >
                <LogOut className="mr-2 size-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
