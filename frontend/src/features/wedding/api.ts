import type { User, WeddingPlan, WeddingPlanMember, Expense, WeddingPlanSummary } from '@/types/domain'
import { DUMMY_WEDDING_PLANS, DUMMY_WEDDING_MEMBERS, DUMMY_USERS } from './mock-data'
import { getExpenses } from '@/features/expenses/api'

/**
 * Wedding Plan API layer (mock).
 * TODO(backend): replace with real endpoints.
 *   GET    /api/wedding-plans            -> WeddingPlan[]
 *   POST   /api/wedding-plans            -> WeddingPlan
 *   GET    /api/wedding-plans/:id        -> WeddingPlan
 *   POST   /api/wedding-plans/:id/invite -> WeddingPlanMember
 *   GET    /api/wedding-plans/:id/members -> WeddingPlanMember[]
 */

const LATENCY_MS = 350
const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))

let plans: WeddingPlan[] = [...DUMMY_WEDDING_PLANS]
let members: WeddingPlanMember[] = [...DUMMY_WEDDING_MEMBERS]

const genId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/**
 * Computes a WeddingPlanSummary from the live expenses array.
 * This is the ONLY source of truth for budget figures — the summary is never
 * stored, always derived, so it can never drift from the underlying expenses.
 */
function computeSummary(totalBudget: number, expenses: Expense[]): WeddingPlanSummary {
  const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0)

  const totalPaid = expenses.reduce((sum, e) => {
    if (e.type === 'one-time') {
      return e.paymentStatus === 'PAID' ? sum + e.totalAmount : sum
    }
    const paid = e.paymentTerms
      .filter((t) => t.status === 'PAID')
      .reduce((s, t) => s + t.amount, 0)
    return sum + paid
  }, 0)

  const remainingBalance = totalBudget - totalExpenses
  const completionPercentage = totalExpenses > 0
    ? Math.round((totalPaid / totalExpenses) * 100)
    : 0

  return { totalExpenses, totalPaid, remainingBalance, completionPercentage }
}

/** Attaches live expenses + a freshly computed summary onto a plan. */
async function hydratePlan(plan: WeddingPlan): Promise<WeddingPlan> {
  const expenses = await getExpenses(plan.id)
  return {
    ...plan,
    expenses,
    summary: computeSummary(plan.totalBudget, expenses),
  }
}

export async function listWeddingPlans(userId: string): Promise<WeddingPlan[]> {
  await delay(undefined)
  const userPlanIds = members
    .filter((m) => m.userId === userId)
    .map((m) => m.weddingPlanId)
  return plans.filter((p) => userPlanIds.includes(p.id))
}

export async function getWeddingPlan(id: string): Promise<WeddingPlan | null> {
  await delay(undefined)
  const plan = plans.find((p) => p.id === id)
  if (!plan) return null
  return hydratePlan(plan)
}

export async function createWeddingPlan(
  name: string,
  weddingDate: string | undefined,
  totalBudget: number,
  user: User,
): Promise<WeddingPlan> {
  await delay(undefined)
  const plan: WeddingPlan = {
    id: genId('wp'),
    name,
    ownerId: user.id,
    totalBudget,
    weddingDate,
    createdAt: new Date().toISOString().slice(0, 10),
    expenses: [],
    summary: { totalExpenses: 0, totalPaid: 0, remainingBalance: totalBudget, completionPercentage: 0 },
    members: [],
  };
  
  const member: WeddingPlanMember = {
    id: genId('wm'),
    weddingPlanId: plan.id,
    userId: user.id,
    user,
    role: 'OWNER',
    joinedAt: plan.createdAt,
  }
  plans = [plan, ...plans]
  members = [member, ...members]
  return plan
}

export async function inviteToPlan(
  weddingPlanId: string,
  email: string,
  _inviter: User,
): Promise<WeddingPlanMember> {
  await delay(undefined)
  const plan = plans.find((p) => p.id === weddingPlanId)
  if (!plan) throw new Error('Wedding plan tidak ditemukan.')

  const invitee = DUMMY_USERS.find((u: { email: string }) => u.email === email)
  if (!invitee) throw new Error('User dengan email tersebut belum terdaftar.')

  const already = members.find(
    (m) => m.weddingPlanId === weddingPlanId && m.userId === invitee.id,
  )
  if (already) throw new Error('User sudah menjadi anggota plan ini.')

  const member: WeddingPlanMember = {
    id: genId('wm'),
    weddingPlanId,
    userId: invitee.id,
    user: invitee,
    role: 'CO_PLANNER',
    joinedAt: new Date().toISOString().slice(0, 10),
  }
  members = [...members, member]
  return member
}

export async function listPlanMembers(weddingPlanId: string): Promise<WeddingPlanMember[]> {
  await delay(undefined)
  return members.filter((m) => m.weddingPlanId === weddingPlanId)
}
