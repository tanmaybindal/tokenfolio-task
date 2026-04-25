'use client';

import { useIsRestoring } from '@tanstack/react-query';

import { useGetServices } from '@/app/(dashboard)/_hooks/get-services';
import DashboardLoading from '@/app/(dashboard)/loading';

import { DashboardHeading } from './dashboard-heading';
import { DashboardMainContent } from './dashboard-main-content';
import { DashboardMetricCards } from './dashboard-metric-cards';
import { DashboardStateProvider } from './dashboard-state-provider';
import { DashboardToolbar } from './dashboard-toolbar';
import { ServiceDeleteDialog } from './service-delete-dialog';
import { ServiceDialog } from './service-dialog';
import {
  addServiceDialogHandle,
  deleteServiceDialogHandle,
  editServiceDialogHandle,
} from './service-dialog-handles';

export function Dashboard() {
  const isRestoring = useIsRestoring();
  const { data: services = [] } = useGetServices();

  if (isRestoring) return <DashboardLoading />;

  return (
    <DashboardStateProvider>
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-16">
        <DashboardHeading />

        <DashboardMetricCards services={services} />

        <DashboardToolbar />

        <DashboardMainContent services={services} />

        <ServiceDialog mode="add" handle={addServiceDialogHandle} />
        <ServiceDialog mode="edit" handle={editServiceDialogHandle} />
        <ServiceDeleteDialog handle={deleteServiceDialogHandle} />
      </main>
    </DashboardStateProvider>
  );
}
