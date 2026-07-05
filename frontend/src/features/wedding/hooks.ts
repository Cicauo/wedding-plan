import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listWeddingPlans, createWeddingPlan, inviteToPlan, listPlanMembers } from './api'
import { useCurrentUser } from '@/features/auth/hooks'

export function useWeddingPlans() {
  const { data: user } = useCurrentUser()

  return useQuery({
    queryKey: ['wedding-plans', user?.id],
    queryFn: () => listWeddingPlans(user!.id),
    enabled: !!user,
  })
}

export function useCurrentWeddingPlan() {
  const { data: plans } = useWeddingPlans()
  // For MVP: user has exactly one active plan (the first one).
  return plans?.[0] ?? null
}

export function useCreateWeddingPlan() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: ({ name, weddingDate, totalBudget }: { name: string; weddingDate?: string, totalBudget: number }) =>
      createWeddingPlan(name, weddingDate, totalBudget, user!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wedding-plans'] })
      navigate('/onboarding/invite')
    },
  })
}

export function useInviteToPlan(weddingPlanId?: string) {
  const qc = useQueryClient()
  const { data: user } = useCurrentUser()

  return useMutation({
    mutationFn: ({ email }: { email: string }) => {
      if (!weddingPlanId) throw new Error('No active wedding plan.')
      return inviteToPlan(weddingPlanId, email, user!)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['plan-members', weddingPlanId] })
    },
  })
}

export function usePlanMembers(weddingPlanId?: string) {
  return useQuery({
    queryKey: ['plan-members', weddingPlanId],
    queryFn: () => listPlanMembers(weddingPlanId!),
    enabled: !!weddingPlanId,
  })
}
