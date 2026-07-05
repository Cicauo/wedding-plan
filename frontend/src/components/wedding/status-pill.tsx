import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "@/types/domain";
import { getUrgency } from "@/lib/urgency";
import { CheckCircle2, AlertTriangle, Clock, CalendarClock } from "lucide-react";

interface StatusPillProps {
  status: PaymentStatus;
  /** Legacy flag — still honored, but `dueDate` gives richer 3-tier output. */
  isOverdue?: boolean;
  /** When provided (and status is UNPAID), renders the 3-tier urgency pill with a live label. */
  dueDate?: Date;
}

/**
 * StatusPill — payment status + urgency in one pill.
 *
 * a11y (WCAG 1.4.1 "Use of Color"): status is NEVER conveyed by color alone —
 * every tier pairs an icon + text label so colorblind / low-vision users and
 * screen readers get the same meaning.
 *
 * PAID              → green  ✓ "Lunas".
 * UNPAID + dueDate  → 3-tier urgency:
 *    overdue → red    ⚠ "Terlambat X hari"
 *    ≤ 3 day → orange ⏰ "Jatuh tempo X hari lagi"
 *    > 3 day → gray   🗓 "Jatuh tempo X hari lagi"
 * UNPAID (no date)  → falls back to legacy label.
 */
export function StatusPill({ status, isOverdue, dueDate }: StatusPillProps) {
  if (status === "PAID") {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="size-3.5" aria-hidden />
        Lunas
      </Badge>
    );
  }

  // UNPAID with a due date → rich urgency pill.
  if (dueDate) {
    const { level, label } = getUrgency(dueDate);
    if (level === "overdue") {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="size-3.5" aria-hidden />
          {label}
        </Badge>
      );
    }
    if (level === "soon") {
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="size-3.5" aria-hidden />
          {label}
        </Badge>
      );
    }
    return (
      <Badge variant="neutral" className="gap-1">
        <CalendarClock className="size-3.5" aria-hidden />
        {label}
      </Badge>
    );
  }

  // Fallback (no date available).
  if (isOverdue) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="size-3.5" aria-hidden />
        Terlambat
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="size-3.5" aria-hidden />
      Belum Lunas
    </Badge>
  );
}
