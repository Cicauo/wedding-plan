import {
  type Expense,
  type InstallmentExpense,
  type OneTimeExpense,
  EXPENSE_CATEGORIES,
} from './domain';
import { groupBy } from 'remeda';

// Re-exporting these types so other modules can import them from one place
export type { BudgetSummary, BudgetCategory, PaymentTask } from './domain';
import type { BudgetSummary, BudgetCategory, PaymentTask } from './domain';

/**
 * Derives a complete budget summary from a list of expenses and a total budget.
 * Calculates planned vs. actual spending for each category.
 */
export function deriveBudgetFromExpenses(expenses: Expense[], totalBudget: number): BudgetSummary {
  const expensesByCategory = groupBy(expenses, (exp) => exp.categoryId);

  const categories: BudgetCategory[] = EXPENSE_CATEGORIES.map((cat) => {
    const categoryExpenses = expensesByCategory[cat.id] || [];
    const planned = categoryExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
    
    const actual = categoryExpenses.reduce((sum, exp) => {
      if (exp.type === 'one-time' && (exp as OneTimeExpense).paymentStatus === 'PAID') {
        return sum + exp.totalAmount;
      }
      if (exp.type === 'installments') {
        const paidTerms = (exp as InstallmentExpense).paymentTerms.filter(t => t.status === 'PAID');
        return sum + paidTerms.reduce((termSum, term) => termSum + term.amount, 0);
      }
      return sum;
    }, 0);

    return {
      id: cat.id,
      name: cat.name,
      planned,
      actual,
      itemCount: categoryExpenses.length,
    };
  });

  const totalPlanned = categories.reduce((sum, cat) => sum + cat.planned, 0);
  const totalActual = categories.reduce((sum, cat) => sum + cat.actual, 0);

  return {
    totalBudget,
    totalPlanned,
    totalActual,
    categories,
  };
}


/**
 * Derives a list of actionable payment tasks from all expenses.
 * Only includes unpaid terms from installment expenses and unpaid one-time expenses.
 */
export function deriveTasksFromExpenses(expenses: Expense[]): PaymentTask[] {
  const tasks: PaymentTask[] = [];

  for (const expense of expenses) {
    if (expense.type === 'one-time' && (expense as OneTimeExpense).paymentStatus === 'UNPAID') {
      const oneTimeExpense = expense as OneTimeExpense;
      tasks.push({
        id: oneTimeExpense.id, // For one-time, task id is expense id
        expenseId: oneTimeExpense.id,
        expenseName: oneTimeExpense.name,
        termName: null,
        categoryId: oneTimeExpense.categoryId,
        amount: oneTimeExpense.totalAmount,
        dueDate: new Date(oneTimeExpense.dueDate),
        status: 'UNPAID',
        isOverdue: new Date(oneTimeExpense.dueDate) < new Date(),
      });
    } else if (expense.type === 'installments') {
      const installmentExpense = expense as InstallmentExpense;
      for (const term of installmentExpense.paymentTerms) {
        if (term.status === 'UNPAID') {
          tasks.push({
            id: term.id,
            expenseId: installmentExpense.id,
            expenseName: installmentExpense.name,
            termName: term.name,
            categoryId: installmentExpense.categoryId,
            amount: term.amount,
            dueDate: new Date(term.dueDate),
            status: 'UNPAID',
            isOverdue: new Date(term.dueDate) < new Date(),
          });
        }
      }
    }
  }

  // Sort tasks by due date, soonest first
  return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
