import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWeddingPlan } from './api';
import type { WeddingPlan } from '@/types/domain';

interface WeddingPlanContextType {
  weddingPlan: WeddingPlan | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const WeddingPlanContext = createContext<WeddingPlanContextType | undefined>(undefined);

export const WeddingPlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // For now, we fetch a hardcoded plan. In a real app, you'd get the ID from auth context/URL.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['wedding-plan', 'wp_sejati_v1'],
    queryFn: () => getWeddingPlan('wp_sejati_v1'),
  });

  const value = useMemo(() => ({
    weddingPlan: data || null,
    isLoading,
    isError,
    refetch
  }), [data, isLoading, isError, refetch]);

  return (
    <WeddingPlanContext.Provider value={value}>
      {children}
    </WeddingPlanContext.Provider>
  );
};

export function useWeddingPlan() {
  const context = useContext(WeddingPlanContext);
  if (context === undefined) {
    throw new Error('useWeddingPlan must be used within a WeddingPlanProvider');
  }
  return context;
}
