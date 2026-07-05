import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EXPENSE_CATEGORIES } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";
import type { InstallmentExpense } from "@/types/domain";

const InstallmentExpenseCard = ({ expense }: { expense: InstallmentExpense }) => {
  const categoryLabel = EXPENSE_CATEGORIES.find(c => c.id === expense.categoryId)?.name || 'Lain-lain';

  const paidAmount = expense.paymentTerms.filter(t => t.status === 'PAID').reduce((sum, t) => sum + t.amount, 0);
  const progress = (paidAmount / expense.totalAmount) * 100;
  const remainingAmount = expense.totalAmount - paidAmount;
  const paidTerms = expense.paymentTerms.filter(t => t.status === 'PAID').length;
  const totalTerms = expense.paymentTerms.length;

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
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Pembayaran</span>
            <span>{paidTerms} / {totalTerms} Selesai</span>
          </div>
          <Progress value={progress} />
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Sisa Tagihan</span>
          <span className="text-xl font-bold text-foreground break-all">{formatCurrency(remainingAmount)}</span>
        </div>
        <div className="flex justify-between items-baseline text-sm">
          <span className="text-muted-foreground">Total Kontrak</span>
          <span className="font-semibold">{formatCurrency(expense.totalAmount)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Diperbarui pada {new Date(expense.updatedAt).toLocaleDateString('id-ID')}</p>
      </CardFooter>
    </Card>
  );
};

export { InstallmentExpenseCard };
