import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { login, register, logout, getCurrentUser } from './api'

const AUTH_KEY = ['auth'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: ({ user }) => {
      qc.setQueryData(AUTH_KEY, user)
      // Navigate to plan selection or main app — will be handled by WeddingGuard
      navigate('/')
    },
  })
}

export function useRegister() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      register(name, email, password),
    onSuccess: ({ user }) => {
      qc.setQueryData(AUTH_KEY, user)
      navigate('/')
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.setQueryData(AUTH_KEY, null)
      qc.clear()
    },
  })
}
