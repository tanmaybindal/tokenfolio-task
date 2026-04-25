'use client';

import { useIsRestoring, useQueryClient } from '@tanstack/react-query';
import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import { useMemo, useState } from 'react';

import {
  DASHBOARD_DEFAULT_VIEW,
  DASHBOARD_SERVICE_STATUS,
  DASHBOARD_SORT_OPTION,
  DASHBOARD_VIEW,
  type DashboardSortOption,
  type DashboardView,
} from '@/app/(dashboard)/_constants/dashboard';
import {
  GET_SERVICES_QUERY_KEY,
  useGetServices,
} from '@/app/(dashboard)/_hooks/get-services';
import { SERVICE_STATUSES, ServiceStatus } from '@/types';

import DashboardLoading from '@/app/(dashboard)/loading';

import { DashboardHeading } from './dashboard-heading';
import { DashboardMainContent } from './dashboard-main-content';
import { DashboardMetricCards } from './dashboard-metric-cards';
import { DashboardToolbar } from './dashboard-toolbar';
import { ServiceDialog } from './service-dialog';

const defaultStatusFilters: ServiceStatus[] = [
  DASHBOARD_SERVICE_STATUS.UP,
  DASHBOARD_SERVICE_STATUS.SLOW,
  DASHBOARD_SERVICE_STATUS.DOWN,
  DASHBOARD_SERVICE_STATUS.RATE_LIMITED,
  DASHBOARD_SERVICE_STATUS.PENDING,
];

export function Dashboard() {
  const isRestoring = useIsRestoring();
  const queryClient = useQueryClient();
  const [view, setViewParam] = useQueryState(
    'view',
    parseAsString.withDefault(DASHBOARD_DEFAULT_VIEW),
  );
  const dashboardView: DashboardView =
    view === DASHBOARD_VIEW.CARD || view === DASHBOARD_VIEW.TABLE
      ? (view as DashboardView)
      : DASHBOARD_DEFAULT_VIEW;
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useQueryState(
    'search',
    parseAsString.withDefault(''),
  );
  const [statusFilterParam, setStatusFilterParam] = useQueryState(
    'status',
    parseAsString.withDefault(defaultStatusFilters.join(',')),
  );
  const [{ cardPageIndex, cardPageSize }, setCardPaginationState] =
    useQueryStates({
      cardPageIndex: parseAsIndex.withDefault(0),
      cardPageSize: parseAsInteger.withDefault(16),
    });
  const [sortOption, setSortOption] = useState<DashboardSortOption>(
    DASHBOARD_SORT_OPTION.NAME_ASC,
  );
  const statusFilters = useMemo(() => {
    const parsed = statusFilterParam
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter((value): value is ServiceStatus =>
        SERVICE_STATUSES.includes(value as ServiceStatus),
      );
    return parsed.length > 0 ? parsed : defaultStatusFilters;
  }, [statusFilterParam]);

  const { data: services = [] } = useGetServices();

  function handleViewChange(values: string[]) {
    const v = values[0];
    if (v === DASHBOARD_VIEW.CARD || v === DASHBOARD_VIEW.TABLE) {
      void setViewParam(v as DashboardView);
      void setCardPaginationState({ cardPageIndex: 0 });
    }
  }
  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: GET_SERVICES_QUERY_KEY });
  }

  function handleSortOptionChange(sort: DashboardSortOption) {
    setSortOption(sort);
    void setCardPaginationState({ cardPageIndex: 0 });
  }

  function handleStatusToggle(status: ServiceStatus) {
    const next = statusFilters.includes(status)
      ? statusFilters.filter((s) => s !== status)
      : [...statusFilters, status];
    void setCardPaginationState({ cardPageIndex: 0 });
    void setStatusFilterParam(
      (next.length > 0 ? next : defaultStatusFilters).join(','),
    );
  }

  function handleMetricFilterChange(filter: ServiceStatus | 'ALL') {
    void setStatusFilterParam(
      (filter === 'ALL' ? defaultStatusFilters : [filter]).join(','),
    );
    void setCardPaginationState({ cardPageIndex: 0 });
  }

  if (isRestoring) return <DashboardLoading />;

  return (
    <main className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 lg:px-16">
      <DashboardHeading />

      <DashboardMetricCards
        services={services}
        statusFilters={statusFilters}
        onMetricFilterChange={handleMetricFilterChange}
      />

      <DashboardToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          void setCardPaginationState({ cardPageIndex: 0 });
        }}
        view={dashboardView}
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
        view={dashboardView}
        sortOption={sortOption}
        statusFilters={statusFilters}
        cardPageSize={cardPageSize}
        cardPageIndex={cardPageIndex}
        onPageIndexChange={(updater) => {
          const next =
            typeof updater === 'function' ? updater(cardPageIndex) : updater;
          void setCardPaginationState({ cardPageIndex: Math.max(0, next) });
        }}
        onPageSizeChange={(size) => {
          void setCardPaginationState({
            cardPageSize: size,
            cardPageIndex: 0,
          });
        }}
        onPageSelect={(page) => {
          void setCardPaginationState({ cardPageIndex: page });
        }}
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
