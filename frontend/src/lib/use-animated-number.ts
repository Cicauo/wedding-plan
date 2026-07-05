import { useEffect, useState } from 'react';
import { animate } from 'motion/react';

/**
 * Animates a number from its previous value to the new target whenever `value`
 * changes. Powers the satisfying "count-up" feedback on the budget figures.
 */
export function useAnimatedNumber(value: number, duration = 0.6): number {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(display, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return display;
}
