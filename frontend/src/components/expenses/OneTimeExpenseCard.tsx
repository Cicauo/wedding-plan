import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXPENSE_CATEGORIES } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";
import type { OneTimeExpense } from "@/types/domain";
import { cn } from "@/lib/utils";

const OneTimeExpenseCard = ({ expense }: { expense: OneTimeExpense }) => {
    const categoryLabel = EXPENSE_CATEGORIES.find(c => c.id === expense.categoryId)?.name || 'Lain-lain';

    const statusMap = {
        PAID: { label: "Lunas", variant: "success" as const },
        UNPAID: { label: "Belum Lunas", variant: "destructive" as const },
    };
    
    const { label, variant } = statusMap[expense.paymentStatus];

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{expense.name}</CardTitle>
                     <div className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {categoryLabel}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                <span className={cn("text-lg font-bold", variant === "success" ? "text-green-500" : "text-destructive")}>
                    {formatCurrency(expense.totalAmount)}
                </span>
                <Badge variant={variant}>{label}</Badge>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">Diperbarui pada {new Date(expense.updatedAt).toLocaleDateString('id-ID')}</p>
            </CardFooter>
        </Card>
    );
};

export { OneTimeExpenseCard };
