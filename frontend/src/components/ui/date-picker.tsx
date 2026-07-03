import * as React from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  /** Optional: disable dates before this (e.g. no past due dates). */
  fromDate?: Date
  id?: string
}

/**
 * DatePicker — composed from Popover + Calendar.
 * Controlled component. Emits a Date; caller serializes to ISO.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = 'Pilih tanggal',
  disabled,
  fromDate,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="opacity-60" />
          {value ? format(value, 'd MMMM yyyy', { locale: idLocale }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date)
            setOpen(false)
          }}
          disabled={fromDate ? { before: fromDate } : undefined}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
