import type { User } from '@/types/domain'
import { DUMMY_USERS } from '@/features/wedding/mock-data'

/**
 * Auth API layer (mock).
 * TODO(backend): replace with real auth endpoints.
 *   POST   /api/auth/login       -> { user, token }
 *   POST   /api/auth/register    -> { user, token }
 *   GET    /api/auth/me          -> User (validate token)
 *   POST   /api/auth/logout      -> void
 */

const LATENCY_MS = 400
const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS))

// In-memory session
let currentUser: User | null = null
let registeredUsers: User[] = [...DUMMY_USERS]

const genId = () => `u_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export async function login(email: string, _password: string): Promise<{ user: User }> {
  await delay(undefined)
  const user = registeredUsers.find((u) => u.email === email)
  if (!user) throw new Error('Email atau password salah.')
  // In production, verify password hash. In mock, accept any password.
  currentUser = user
  return { user }
}

export async function register(name: string, email: string, _password: string): Promise<{ user: User }> {
  await delay(undefined)
  if (registeredUsers.find((u) => u.email === email)) {
    throw new Error('Email sudah terdaftar.')
  }
  const user: User = {
    id: genId(),
    email,
    name,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  registeredUsers = [...registeredUsers, user]
  currentUser = user
  return { user }
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(undefined)
  return currentUser
}

export async function logout(): Promise<void> {
  await delay(undefined)
  currentUser = null
}
