import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useWeddingPlan } from './WeddingPlanContext';

/**
 * Route guard: ensures a wedding plan is active.
 *
 * - If a plan is loaded, it renders the protected content (<Outlet />).
 * - If still loading, it shows a spinner.
 * - If there's no active plan (and not already on an onboarding route),
 *   it redirects the user to the start of the onboarding flow.
 */
export function WeddingGuard() {
  const { weddingPlan, isLoading } = useWeddingPlan();
  const location = useLocation();

  const isOnboarding = location.pathname.startsWith('/onboarding');

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If a plan exists, allow access to protected routes.
  if (weddingPlan) {
    return <Outlet />;
  }

  // If no plan and user is trying to access protected routes, redirect to onboarding.
  if (!weddingPlan && !isOnboarding) {
    return <Navigate to="/onboarding/setup" replace />;
  }
  
  // If no plan but user is on an onboarding route, let them proceed.
  // This case is handled by the router structure itself, but as a fallback:
  return <Outlet />;
}
