import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatRupiahBare, parseRupiah } from '@/lib/currency'
import type { Rupiah } from '@/types/domain'

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  /** Integer rupiah value (source of truth). */
  value: Rupiah
  /** Emits the parsed integer, not the formatted string. */
  onValueChange: (value: Rupiah) => void
}

/**
 * CurrencyInput — money field with live "Rp" formatting.
 * Stores/emits an INTEGER; formatting is presentation-only.
 * Uses inputMode="numeric" for mobile numeric keypad + tabular
 * figures so digits stay aligned while scanning.
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const display = value > 0 ? formatRupiahBare(value) : ''

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange(parseRupiah(e.target.value))
    }

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Rp
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder="0"
          className={cn(
            'flex h-10 w-full rounded-[var(--radius)] border border-input bg-background pl-9 pr-3 py-2 text-sm font-medium tabular-nums ring-offset-background transition-colors',
            'placeholder:text-muted-foreground placeholder:font-normal',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          {...props}
        />
      </div>
    )
  },
)
CurrencyInput.displayName = 'CurrencyInput'
