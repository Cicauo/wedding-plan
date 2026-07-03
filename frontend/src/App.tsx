import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

/**
 * Route-level code splitting: each page is a separate chunk, so the
 * initial bundle stays lean and heavy deps (day-picker, recharts,
 * RHF) only load when their route is visited.
 */
const Home = lazy(() => import('@/pages/Home'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const GuestList = lazy(() => import('@/pages/GuestList'))
const DesignSystem = lazy(() => import('@/pages/DesignSystem'))
const VendorListPage = lazy(() => import('@/features/vendors/VendorListPage'))
const VendorDetailPage = lazy(() => import('@/features/vendors/VendorDetailPage'))

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
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/guests" element={<GuestList />} />
            <Route path="/vendors" element={<VendorListPage />} />
            <Route path="/vendors/:vendorId" element={<VendorDetailPage />} />
            <Route path="/design-system" element={<DesignSystem />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
