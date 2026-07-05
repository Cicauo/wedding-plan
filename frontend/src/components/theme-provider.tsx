import type { ReactNode } from "react"

/**
 * Lightweight theme provider stub. For MVP we default to the light theme
 * defined in CSS. Swap in `next-themes` later if dark-mode toggling is needed.
 */
export function ThemeProvider({ children }: { children: ReactNode; [key: string]: unknown }) {
  return <>{children}</>
}
