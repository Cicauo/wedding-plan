import { type Expense, type CreateExpensePayload, type PaymentTerm, type OneTimeExpense, type InstallmentExpense } from "@/types/domain";
import { MOCK_EXPENSES } from "./mock-expense-data";

let expenses: Expense[] = [...MOCK_EXPENSES];
const LATENCY_MS = 300;

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const genId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export async function getExpenses(weddingPlanId: string): Promise<Expense[]> {
  await delay([]);
  return expenses.filter(e => e.weddingPlanId === weddingPlanId);
}

export async function getExpense(id: string): Promise<Expense | undefined> {
    await delay(undefined);
    return expenses.find(e => e.id === id);
}

export async function createExpense(payload: CreateExpensePayload): Promise<Expense> {
    await delay(undefined);
    
    const baseExpense = {
        id: genId('exp'),
        weddingPlanId: 'wp_sejati_v1', // hardcoded for now
        name: payload.name,
        categoryId: payload.categoryId,
        totalAmount: payload.totalAmount,
        notes: payload.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    let newExpense: Expense;

    if (payload.type === 'one-time') {
        newExpense = {
            ...baseExpense,
            type: 'one-time',
            dueDate: payload.dueDate.toISOString(),
            paymentStatus: 'UNPAID',
        } as OneTimeExpense;
    } else {
        const { termCount, downPayment = 0 } = payload;
        const remainingAmount = payload.totalAmount - downPayment;
        const installmentAmount = remainingAmount / (termCount - (downPayment > 0 ? 1 : 0));
        
        const paymentTerms: PaymentTerm[] = [];

        if (downPayment > 0) {
            paymentTerms.push({
                id: genId('term'),
                name: 'Down Payment',
                amount: downPayment,
                dueDate: new Date().toISOString(), // DP is due now
                status: 'UNPAID',
            });
        }
        
        for (let i = 0; i < termCount - (downPayment > 0 ? 1 : 0); i++) {
            const dueDate = new Date(payload.dueDate);
            dueDate.setMonth(dueDate.getMonth() - i);
            paymentTerms.push({
                id: genId('term'),
                name: `Cicilan ${termCount - i - (downPayment > 0 ? 1: 0)}`,
                amount: installmentAmount,
                dueDate: dueDate.toISOString(),
                status: 'UNPAID',
            });
        }

        newExpense = {
            ...baseExpense,
            type: 'installments',
            paymentTerms: paymentTerms.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
        } as InstallmentExpense;
    }

    expenses.push(newExpense);
    return newExpense;
}

export async function setPaymentTermStatus(expenseId: string, termId: string, status: 'PAID' | 'UNPAID'): Promise<PaymentTerm> {
    await delay(undefined);
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense || expense.type !== 'installments') {
        throw new Error("Expense or term not found");
    }

    const term = (expense as InstallmentExpense).paymentTerms.find(t => t.id === termId);
    if (!term) {
        throw new Error("Term not found");
    }
    term.status = status;
    expense.updatedAt = new Date().toISOString();
    return term;
}

/**
 * Toggles the paid status of a ONE-TIME expense.
 * (For installments use setPaymentTermStatus.)
 */
export async function setOneTimeExpenseStatus(expenseId: string, status: 'PAID' | 'UNPAID'): Promise<OneTimeExpense> {
    await delay(undefined);
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense || expense.type !== 'one-time') {
        throw new Error("One-time expense not found");
    }
    (expense as OneTimeExpense).paymentStatus = status;
    expense.updatedAt = new Date().toISOString();
    return expense as OneTimeExpense;
}

/**
 * Updates the editable fields of an expense. Name / category / notes only.
 * Amount & term restructuring intentionally NOT editable in MVP to keep the
 * derived tasks/budget deterministic.
 */
export async function updateExpense(
    id: string,
    patch: Partial<Pick<Expense, 'name' | 'categoryId' | 'notes'>>
): Promise<Expense> {
    await delay(undefined);
    const expense = expenses.find(e => e.id === id);
    if (!expense) {
        throw new Error("Expense not found");
    }
    if (patch.name !== undefined) expense.name = patch.name;
    if (patch.categoryId !== undefined) expense.categoryId = patch.categoryId;
    if (patch.notes !== undefined) expense.notes = patch.notes;
    expense.updatedAt = new Date().toISOString();
    return expense;
}

/**
 * Deletes an expense. Because tasks & budget are DERIVED from the expenses
 * array (never stored), removing the expense here automatically removes all
 * its tasks and its budget allocation on the next derive — no "ghost data".
 */
export async function deleteExpense(id: string): Promise<{ id: string }> {
    await delay(undefined);
    const before = expenses.length;
    expenses = expenses.filter(e => e.id !== id);
    if (expenses.length === before) {
        throw new Error("Expense not found");
    }
    return { id };
}
