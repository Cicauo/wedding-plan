import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, type InputProps } from './input';

interface InputCurrencyProps extends Omit<InputProps, 'value' | 'onValueChange'> {
  value: number;
  onValueChange: (value: number) => void;
}

const format = (val: number | undefined) => {
  if (val === undefined || val === null || val === 0) return '';
  return new Intl.NumberFormat('id-ID').format(val);
};

const parse = (val: string) => {
  return parseInt(val.replace(/\./g, ''), 10) || 0;
};

const InputCurrency = React.forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => format(value));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const parsed = parse(e.target.value);
      setDisplay(format(parsed));
      onValueChange(parsed);
    };

    const handleBlur = () => {
      setDisplay(format(value));
    };

    React.useEffect(() => {
      // Update display value if the external value changes
      if (parse(display) !== value) {
        setDisplay(format(value));
      }
    }, [value, display]);

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          Rp
        </span>
        <Input
          ref={ref}
          className={cn('pl-9', className)}
          value={display}
          onChange={handleChange}
          onBlur={handleBlur}
          inputMode="numeric"
          {...props}
        />
      </div>
    );
  }
);
InputCurrency.displayName = 'InputCurrency';

export { InputCurrency };
