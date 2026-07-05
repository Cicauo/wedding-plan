import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/wedding/status-pill";
import { EXPENSE_CATEGORIES } from "@/types/domain";
import { formatCurrency, cn } from "@/lib/utils";
import type { OneTimeExpense } from "@/types/domain";

const OneTimeExpenseCard = ({ expense }: { expense: OneTimeExpense }) => {
  const categoryLabel = EXPENSE_CATEGORIES.find(c => c.id === expense.categoryId)?.name || 'Lain-lain';

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">{expense.name}</CardTitle>
          <div className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
            {categoryLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center gap-4">
        <span className={cn("text-lg font-bold truncate", expense.paymentStatus === "PAID" ? "text-emerald-600" : "text-destructive")}>
          {formatCurrency(expense.totalAmount)}
        </span>
        <StatusPill status={expense.paymentStatus} dueDate={new Date(expense.dueDate)} />
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Diperbarui pada {new Date(expense.updatedAt).toLocaleDateString('id-ID')}</p>
      </CardFooter>
    </Card>
  );
};

export { OneTimeExpenseCard };
