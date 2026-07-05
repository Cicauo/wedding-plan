import { useState, useRef } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { OneTimeExpenseForm } from "./OneTimeExpenseForm";
import { InstallmentExpenseForm } from "./InstallmentExpenseForm";
import { useCreateExpense } from "@/features/expenses/hooks";
import { useWeddingPlan } from "@/features/wedding/WeddingPlanContext";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ExpenseType, CreateExpensePayload } from "@/types/domain";

const expenseTypes: { label: string; value: ExpenseType }[] = [
  { label: "Sekali Bayar", value: "one-time" },
  { label: "Cicilan", value: "installments" },
];

interface AddExpenseModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddExpenseModal({ isOpen, onOpenChange }: AddExpenseModalProps) {
  const [activeForm, setActiveForm] = useState<ExpenseType>("one-time");
  const formRef = useRef<HTMLFormElement>(null);
  const createExpense = useCreateExpense();
  const { weddingPlan } = useWeddingPlan();

  // Pending payload awaiting an over-budget confirmation.
  const [pendingPayload, setPendingPayload] = useState<CreateExpensePayload | null>(null);
  const [overBudgetBy, setOverBudgetBy] = useState(0);

  const totalBudget = weddingPlan?.totalBudget ?? 0;
  const usedBudget = weddingPlan?.summary?.totalExpenses ?? 0;
  const remaining = totalBudget - usedBudget;

  const handleFormSubmit = () => {
    formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  const doCreate = (payload: CreateExpensePayload) => {
    createExpense.mutate(payload, {
      onSuccess: () => {
        setPendingPayload(null);
        onOpenChange(false);
      },
    });
  };

  // Called by the child form only AFTER Zod validation passes.
  const handleValidSubmit = (payload: CreateExpensePayload) => {
    const over = payload.totalAmount - remaining;
    if (over > 0) {
      // Don't block — warn and let the user decide (respects autonomy).
      setOverBudgetBy(over);
      setPendingPayload(payload);
      return;
    }
    doCreate(payload);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent mobileSheet className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Tambah Pengeluaran</DialogTitle>
            <DialogDescription>
              Pilih jenis pengeluaran dan isi detailnya.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <SegmentedControl<ExpenseType>
              options={expenseTypes}
              value={activeForm}
              onValueChange={(val) => setActiveForm(val)}
            />
          </div>

          <div>
            {activeForm === "one-time" ? (
              <OneTimeExpenseForm ref={formRef} onValidSubmit={handleValidSubmit} />
            ) : (
              <InstallmentExpenseForm ref={formRef} onValidSubmit={handleValidSubmit} />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="button" onClick={handleFormSubmit} disabled={createExpense.isPending}>
              {createExpense.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" />Menyimpan...</> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Over-budget confirmation — warns, does NOT block. */}
      <Dialog open={!!pendingPayload} onOpenChange={(open) => !open && setPendingPayload(null)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>Pengeluaran melebihi sisa budget</DialogTitle>
            <DialogDescription>
              Wah, pengeluaran ini akan membuatmu over-budget{" "}
              <span className="font-semibold text-foreground">{formatCurrency(overBudgetBy)}</span>.
              Tetap lanjutkan?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setPendingPayload(null)}>
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => pendingPayload && doCreate(pendingPayload)}
              disabled={createExpense.isPending}
            >
              {createExpense.isPending ? <><Loader2 className="mr-1 size-4 animate-spin" />Menyimpan...</> : "Ya, Lanjutkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
