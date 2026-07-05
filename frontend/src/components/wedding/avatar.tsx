import { cn } from '@/lib/utils'
import type { User } from '@/types/domain'

interface AvatarProps {
  user: Pick<User, 'name' | 'avatarUrl'>
  className?: string
  size?: 'sm' | 'md'
}

/** Simple initial-based avatar with optional photo. */
export function Avatar({ user, className, size = 'sm' }: AvatarProps) {
  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-primary/10 font-medium text-primary',
        size === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm',
        className,
      )}
      title={user.name}
    >
      {initials}
    </span>
  )
}

interface AvatarGroupProps {
  users: Pick<User, 'name' | 'avatarUrl'>[]
  className?: string
}

/** Stacked avatar group for "Dita + Bimo" visual. */
export function AvatarGroup({ users, className }: AvatarGroupProps) {
  return (
    <div className={cn('flex -space-x-2', className)}>
      {users.map((u) => (
        <Avatar key={u.name} user={u} className="ring-2 ring-background" />
      ))}
    </div>
  )
}
