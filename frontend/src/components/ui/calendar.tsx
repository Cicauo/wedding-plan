import { DayPicker } from 'react-day-picker'
import { id as idLocale } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Calendar — wraps react-day-picker (v9/v10) with our tokens.
 * Localized to Indonesian. Used inside the DatePicker popover.
 */
export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={idLocale}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'relative flex flex-col sm:flex-row gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex justify-center pt-1 relative items-center h-9',
        caption_label: 'text-sm font-medium',
        nav: 'absolute top-1 flex w-full justify-between px-1 z-10',
        button_previous:
          'inline-flex items-center justify-center h-7 w-7 rounded-md opacity-70 hover:opacity-100 hover:bg-accent transition-colors',
        button_next:
          'inline-flex items-center justify-center h-7 w-7 rounded-md opacity-70 hover:opacity-100 hover:bg-accent transition-colors',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-xs',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative',
        day_button:
          'inline-flex h-9 w-9 items-center justify-center rounded-md font-normal hover:bg-accent hover:text-accent-foreground transition-colors aria-selected:opacity-100',
        selected:
          '[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary',
        today: '[&>button]:bg-accent [&>button]:font-semibold',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" {...chevronProps} />
          ) : (
            <ChevronRight className="h-4 w-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
