import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { formatRupiah } from '@/lib/currency'

/**
 * Gentle confetti burst — subtle enough for "Tandai Lunas",
 * celebratory enough to feel rewarding.
 */
export function fireConfetti() {
  // Basic burst from the centre, scaled to preferability over drama.
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#22c55e', '#16a34a', '#10b981', '#84cc16'],
  })
}

/** Generic celebration: a subtle confetti burst. Use for payment completions. */
export function celebrate() {
  fireConfetti()
}

/**
 * Toast + confetti when a term is marked paid.
 * @param termName e.g. "Pelunasan"
 * @param vendorName e.g. "Sedap Catering"
 * @param amount e.g. 20_000_000
 */
export function celebratePaid(termName: string, vendorName: string, amount: number) {
  toast.success(`Mantap! ${termName} ke ${vendorName} (${formatRupiah(amount)}) beres. ✅`)
  fireConfetti()
}

/**
 * Toast + confetti when a vendor reaches 100% paid (milestone).
 * @param vendorName e.g. "Sedap Catering"
 */
export function celebrateFullyPaid(vendorName: string) {
  toast.success(`🎉 ${vendorName} lunas! Satu urusan beres.`, { duration: 5000 })
  fireConfetti()
  // Second burst slightly delayed for drama.
  setTimeout(() => fireConfetti(), 300)
}

/**
 * Toast when "Semua terjadwal" milestone is hit.
 */
export function celebrateAllScheduled() {
  toast.success('✅ Semua pembayaran sudah terjadwal rapi.', { duration: 3000 })
}

/**
 * Generic toast for "undo" / "batalkan" — no confetti, just info.
 */
export function celebrateUndone(termName: string, vendorName: string) {
  toast.info(`Tandai batal ${termName} ke ${vendorName}. Status dikembalikan.`)
}
