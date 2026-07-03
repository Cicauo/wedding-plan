import { NavLink } from 'react-router-dom'
import { CreditCard, LayoutGrid, Store, Wallet } from 'lucide-react'

const LINKS = [
  { to: '/vendors', label: 'Vendor', icon: Store },
  { to: '/todos', label: 'To-Do', icon: CreditCard },
  { to: '/budget', label: 'Budget', icon: Wallet },
] as const

/**
 * AppNav — top navigation shell shared across the planning modules.
 * Uses NavLink so the active route is highlighted; client-side nav
 * keeps the query cache warm (important for the Phase 2 sync demo:
 * marking paid in one tab is instantly reflected when you switch).
 */
export function AppNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-2.5">
        <NavLink
          to="/"
          className="mr-2 flex items-center gap-2 font-semibold text-foreground"
        >
          <LayoutGrid className="size-5 text-primary" />
          <span className="hidden sm:inline">Wedding Plan</span>
        </NavLink>

        <div className="flex items-center gap-1">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                'flex items-center gap-1.5 rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium transition-colors ' +
                (isActive
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground')
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
