import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ThemeProvider } from '@/components/theme-provider'
import { WeddingPlanProvider } from '@/features/wedding/WeddingPlanContext'

// Guards & Nav
import { AuthGuard } from '@/features/auth/AuthGuard'
import { WeddingGuard } from '@/features/wedding/WeddingGuard'

// Public pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))

// Onboarding flow
const OnboardingSetupPage = lazy(() => import('@/features/wedding/OnboardingSetupPage'))
const OnboardingInvitePage = lazy(() => import('@/features/wedding/OnboardingInvitePage'))

// Protected pages (lazy-loaded)
const Home = lazy(() => import('@/pages/Home'))
const ExpenseDetailPage = lazy(() => import('@/pages/ExpenseDetailPage'))
const TodoListPage = lazy(() => import('@/features/planning/TodoListPage'))
const BudgetPage = lazy(() => import('@/features/planning/BudgetPage'))
const DesignSystem = lazy(() => import('@/pages/DesignSystem'))


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={queryClient}>
        <WeddingPlanProvider>
            <BrowserRouter>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected routes — requires auth. AuthGuard renders
                      AppNav + Toaster chrome around the nested routes. */}
                  <Route element={<AuthGuard />}>
                    {/* Routes accessible only when a wedding plan is NOT set */}
                    <Route path="/onboarding/setup" element={<OnboardingSetupPage />} />
                    <Route path="/onboarding/invite" element={<OnboardingInvitePage />} />

                    {/* Routes accessible only when a wedding plan IS set */}
                    <Route element={<WeddingGuard />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/expenses/:id" element={<ExpenseDetailPage />} />
                      <Route path="/planning/tasks" element={<TodoListPage />} />
                      <Route path="/planning/budget" element={<BudgetPage />} />
                      <Route path="/design-system" element={<DesignSystem />} />
                    </Route>
                  </Route>

                  {/* Catch-all: redirect to login */}
                  <Route path="*" element={<LoginPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
        </WeddingPlanProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
