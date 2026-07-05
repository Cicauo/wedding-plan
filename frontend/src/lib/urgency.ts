/**
 * Urgency helpers for payment due-dates.
 * Drives the 3-tier status pill (neutral / soon / overdue) and its labels.
 */

export type UrgencyLevel = 'neutral' | 'soon' | 'overdue';

export interface Urgency {
  level: UrgencyLevel;
  /** Whole days until due. Negative = overdue by that many days. */
  daysLeft: number;
  /** Human label, e.g. "Jatuh tempo 3 hari lagi" or "Terlambat 2 hari". */
  label: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Days between now (midnight) and the due date (midnight). */
function diffInDays(due: Date, now: Date = new Date()): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

/**
 * Classifies a due date into an urgency tier per the Phase 3 spec:
 *  - overdue   → red    ("Terlambat X hari")
 *  - soon ≤ 3d → orange ("Jatuh tempo X hari lagi" / "hari ini" / "besok")
 *  - > 7d      → neutral (gray)
 *  - 4–7d      → neutral-ish; still gray but not "soon"
 */
export function getUrgency(dueDate: Date, now: Date = new Date()): Urgency {
  const daysLeft = diffInDays(dueDate, now);

  if (daysLeft < 0) {
    const overdueBy = Math.abs(daysLeft);
    return {
      level: 'overdue',
      daysLeft,
      label: `Terlambat ${overdueBy} hari`,
    };
  }

  if (daysLeft <= 3) {
    let label: string;
    if (daysLeft === 0) label = 'Jatuh tempo hari ini';
    else if (daysLeft === 1) label = 'Jatuh tempo besok';
    else label = `Jatuh tempo ${daysLeft} hari lagi`;
    return { level: 'soon', daysLeft, label };
  }

  return {
    level: 'neutral',
    daysLeft,
    label: `Jatuh tempo ${daysLeft} hari lagi`,
  };
}
