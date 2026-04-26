'use client';

import { createContext, type ReactNode, useContext } from 'react';

import {
  type DashboardState,
  useDashboardState,
} from '@/app/(dashboard)/_hooks/use-dashboard-state';

const DashboardStateContext = createContext<DashboardState | null>(null);

interface DashboardStateProviderProps {
  children: ReactNode;
}

export function DashboardStateProvider({
  children,
}: DashboardStateProviderProps) {
  const dashboard = useDashboardState();

  return (
    <DashboardStateContext.Provider value={dashboard}>
      {children}
    </DashboardStateContext.Provider>
  );
}

export function useDashboardStateContext() {
  const dashboard = useContext(DashboardStateContext);

  if (!dashboard) {
    throw new Error(
      'useDashboardStateContext must be used within DashboardStateProvider',
    );
  }

  return dashboard;
}
