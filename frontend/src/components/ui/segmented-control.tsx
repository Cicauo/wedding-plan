import { cn } from '@/lib/utils'

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[]
  value: T
  onValueChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex w-full rounded-md bg-muted p-1">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            'flex-1 rounded-sm py-1.5 text-center text-sm font-medium transition-colors',
            value === option.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export type { SegmentedControlProps }
