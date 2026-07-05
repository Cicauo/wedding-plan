import * as React from 'react'
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  onCreate?: (value: string) => void
  placeholder?: string
}

export function Combobox({
  options,
  value,
  onChange,
  onCreate,
  placeholder = 'Pilih...',
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filteredOptions =
    search === ''
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(search.toLowerCase())
        )

  const selectedLabel = options.find((o) => o.value === value)?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLabel || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <div className="p-2">
          <Input
            placeholder="Cari atau buat baru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setOpen(false)
              }}
              className="flex cursor-pointer items-center justify-between p-2 hover:bg-accent"
            >
              <span>{option.label}</span>
              <Check
                className={cn(
                  'h-4 w-4',
                  value === option.value ? 'opacity-100' : 'opacity-0'
                )}
              />
            </div>
          ))}
          {onCreate && filteredOptions.length === 0 && search.length > 0 && (
            <div
              onClick={() => {
                onCreate(search)
                setOpen(false)
              }}
              className="flex cursor-pointer items-center gap-2 p-2 text-sm text-muted-foreground hover:bg-accent"
            >
              <PlusCircle className="h-4 w-4" />
              Buat kategori "{search}"
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
