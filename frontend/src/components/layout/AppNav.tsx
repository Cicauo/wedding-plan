import { Link, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/', label: 'Expense Hub' },
  { to: '/planning/tasks', label: 'Daftar Pembayaran' },
  { to: '/planning/budget', label: 'Budget' },
];

export function AppNav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex items-center gap-1 border-b px-6 py-2 text-sm text-muted-foreground">
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="rounded-md px-3 py-1.5 transition hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground"
          aria-current={pathname.startsWith(link.to) ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
