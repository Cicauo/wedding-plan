import type { User, WeddingPlan, WeddingPlanMember } from '@/types/domain';
import { MOCK_EXPENSES } from '@/features/expenses/mock-expense-data';

export const DUMMY_USERS: User[] = [
  {
    id: 'usr_superadmin',
    name: 'Super Admin',
    email: 'superadmin@sejati-ai.com',
    avatarUrl: undefined,
    createdAt: '2026-01-01',
  },
  {
    id: 'usr_partner',
    name: 'Calon Pasangan',
    email: 'partner@sejati-ai.com',
    avatarUrl: undefined,
    createdAt: '2026-01-02',
  },
];

const computeSummary = (expenses: typeof MOCK_EXPENSES) => {
  let totalExpenses = 0;
  let totalPaid = 0;
  for (const exp of expenses) {
    totalExpenses += exp.totalAmount;
    if (exp.type === 'one-time') {
      if (exp.paymentStatus === 'PAID') totalPaid += exp.totalAmount;
    } else {
      totalPaid += exp.paymentTerms
        .filter((t) => t.status === 'PAID')
        .reduce((s, t) => s + t.amount, 0);
    }
  }
  const remainingBalance = totalExpenses - totalPaid;
  const completionPercentage = totalExpenses > 0 ? Math.round((totalPaid / totalExpenses) * 100) : 0;
  return { totalExpenses, totalPaid, remainingBalance, completionPercentage };
};

const sejatiExpenses = MOCK_EXPENSES.filter((e) => e.weddingPlanId === 'wp_sejati_v1');

export const DUMMY_WEDDING_PLANS: WeddingPlan[] = [
  {
    id: 'wp_sejati_v1',
    name: 'Pernikahan Sejati',
    ownerId: 'usr_superadmin',
    totalBudget: 250_000_000,
    weddingDate: '2026-12-12',
    createdAt: '2026-01-05',
    expenses: sejatiExpenses,
    summary: computeSummary(sejatiExpenses),
    members: [],
  },
];

export const DUMMY_WEDDING_MEMBERS: WeddingPlanMember[] = [
  {
    id: 'wm_1',
    weddingPlanId: 'wp_sejati_v1',
    userId: 'usr_superadmin',
    user: DUMMY_USERS[0],
    role: 'OWNER',
    joinedAt: '2026-01-05',
  },
];

// Wire members back into the plan object for convenience.
DUMMY_WEDDING_PLANS[0].members = DUMMY_WEDDING_MEMBERS.filter(
  (m) => m.weddingPlanId === 'wp_sejati_v1',
);
