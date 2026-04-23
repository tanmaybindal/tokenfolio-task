'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, useSyncExternalStore } from 'react';

import {
  DASHBOARD_SERVICE_STATUS,
  DASHBOARD_SORT_OPTION,
  type DashboardSortOption,
} from '@/app/(dashboard)/_constants/dashboard';
import {
  GET_SERVICES_QUERY_KEY,
  useGetServices,
} from '@/app/(dashboard)/_hooks/get-services';
import {
  getViewServerSnapshot,
  getViewSnapshot,
  isView,
  setView,
  subscribeViewStore,
} from '@/app/(dashboard)/_libs/dashboard-client-store';
import { Service, ServiceStatus } from '@/types';

import { DashboardHeading } from './dashboard-heading';
import { DashboardMainContent } from './dashboard-main-content';
import { DashboardMetricCards } from './dashboard-metric-cards';
import { DashboardToolbar } from './dashboard-toolbar';
import { ServiceDialog } from './service-dialog';

export function Dashboard({ initialServices }: { initialServices: Service[] }) {
  const queryClient = useQueryClient();
  const view = useSyncExternalStore(
    subscribeViewStore,
    getViewSnapshot,
    getViewServerSnapshot,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cardPageIndex, setCardPageIndex] = useState(0);
  const [cardPageSize, setCardPageSize] = useState(16);
  const [sortOption, setSortOption] = useState<DashboardSortOption>(
    DASHBOARD_SORT_OPTION.NAME_ASC,
  );
  const [statusFilters, setStatusFilters] = useState<ServiceStatus[]>([
    DASHBOARD_SERVICE_STATUS.UP,
    DASHBOARD_SERVICE_STATUS.SLOW,
    DASHBOARD_SERVICE_STATUS.DOWN,
  ]);

  const { data: services = initialServices } = useGetServices(initialServices);

  function handleViewChange(values: string[]) {
    const v = values[0];
    if (isView(v)) {
      setView(v);
    }
  }
  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: GET_SERVICES_QUERY_KEY });
  }

  function handleSortOptionChange(sort: DashboardSortOption) {
    setSortOption(sort);
    setCardPageIndex(0);
  }

  function handleStatusToggle(status: ServiceStatus) {
    setStatusFilters((prev) => {
      const next = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];
      setCardPageIndex(0);
      return next;
    });
  }

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-16">
      <DashboardHeading />

      <DashboardMetricCards services={services} />

      <DashboardToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setCardPageIndex(0);
        }}
        view={view}
        sortOption={sortOption}
        statusFilters={statusFilters}
        onSortOptionChange={handleSortOptionChange}
        onStatusToggle={handleStatusToggle}
        onViewChange={handleViewChange}
        onAddService={() => setAddOpen(true)}
      />

      <DashboardMainContent
        services={services}
        search={search}
        view={view}
        sortOption={sortOption}
        statusFilters={statusFilters}
        cardPageSize={cardPageSize}
        cardPageIndex={cardPageIndex}
        onPageIndexChange={setCardPageIndex}
        onPageSizeChange={(size) => {
          setCardPageSize(size);
          setCardPageIndex(0);
        }}
        onPageSelect={setCardPageIndex}
        onRefresh={invalidate}
        onAddService={() => setAddOpen(true)}
      />

      <ServiceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        onSuccess={invalidate}
      />
    </main>
  );
}
