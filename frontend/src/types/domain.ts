/**
 * ============================================================
 *                    CORE DOMAIN TYPES
 * 
 * This file is the single source of truth for all data models
 * in the application. Changes here have wide-reaching effects.
 * ============================================================
 */

export type Rupiah = number;
export type ISODate = string;

// -------------------------
// AUTH & COLLABORATION
// -------------------------

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: ISODate;
}

export type WeddingPlanRole = 'OWNER' | 'CO_PLANNER';

export interface WeddingPlanMember {
  id: string;
  weddingPlanId: string;
  userId: string;
  user: User;
  role: WeddingPlanRole;
  joinedAt: ISODate;
}


// -------------------------
// EXPENSES
// -------------------------

export const EXPENSE_CATEGORIES = [
  { id: 'venue', name: 'Venue & Lokasi' },
  { id: 'catering', name: 'Katering & Makanan' },
  { id: 'photo_video', name: 'Foto & Video' },
  { id: 'attire', name: 'Pakaian & Cincin' },
  { id: 'music', name: 'Musik & Hiburan' },
  { id: 'decor', name: 'Dekorasi & Bunga' },
  { id: 'invitations', name: 'Undangan & Suvenir' },
  { id: 'other', name: 'Lain-lain' },
] as const;

export type ExpenseCategoryId = typeof EXPENSE_CATEGORIES[number]['id'];

export type ExpenseType = 'one-time' | 'installments';
export type PaymentStatus = 'PAID' | 'UNPAID';

interface BaseExpense {
  id: string;
  weddingPlanId: string;
  name: string;
  categoryId: ExpenseCategoryId;
  totalAmount: Rupiah;
  notes?: string;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface OneTimeExpense extends BaseExpense {
  type: 'one-time';
  dueDate: ISODate;
  paymentStatus: PaymentStatus;
  proofUrl?: string;
}

export interface PaymentTerm {
  id: string;
  name: string;
  amount: Rupiah;
  dueDate: ISODate;
  status: PaymentStatus;
  proofUrl?: string;
}

export interface InstallmentExpense extends BaseExpense {
  type: 'installments';
  paymentTerms: PaymentTerm[];
}

export type Expense = OneTimeExpense | InstallmentExpense;


// -------------------------
// WEDDING PLAN & SUMMARY
// -------------------------

export interface WeddingPlanSummary {
  totalExpenses: Rupiah;
  totalPaid: Rupiah;
  remainingBalance: Rupiah;
  completionPercentage: number;
}

export interface WeddingPlan {
  id: string;
  name: string;
  ownerId: string;
  totalBudget: Rupiah;
  weddingDate?: ISODate;
  createdAt: ISODate;
  expenses: Expense[];
  summary: WeddingPlanSummary;
  members: WeddingPlanMember[];
}


// -------------------------
// API PAYLOADS & DERIVED TYPES
// -------------------------

interface BaseExpensePayload {
  name: string;
  categoryId: ExpenseCategoryId;
  totalAmount: Rupiah;
  dueDate: Date;
  notes?: string;
}

export interface CreateOneTimeExpensePayload extends BaseExpensePayload {
  type: 'one-time';
}

export interface CreateInstallmentExpensePayload extends BaseExpensePayload {
  type: 'installments';
  termCount: number;
  downPayment?: Rupiah;
}

export type CreateExpensePayload =
  | CreateOneTimeExpensePayload
  | CreateInstallmentExpensePayload;

export interface BudgetCategory {
    id: ExpenseCategoryId;
    name: string;
    planned: Rupiah;
    actual: Rupiah;
    itemCount: number;
}

export interface BudgetSummary {
    totalBudget: Rupiah;
    totalPlanned: Rupiah;
    totalActual: Rupiah;
    categories: BudgetCategory[];
}

export interface PaymentTask {
    id: string;
    expenseId: string;
    /** Name of the parent expense, e.g. "Katering Enak". */
    expenseName: string;
    /** Name of the specific term, e.g. "Pelunasan". Null for one-time expenses. */
    termName: string | null;
    categoryId: ExpenseCategoryId;
    amount: Rupiah;
    dueDate: Date;
    status: 'UNPAID';
    isOverdue: boolean;
}
