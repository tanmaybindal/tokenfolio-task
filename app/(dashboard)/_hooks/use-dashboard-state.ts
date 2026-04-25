import {
  parseAsIndex,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import { useCallback, useMemo } from 'react';

import {
  DASHBOARD_DEFAULT_STATUS_FILTERS,
  DASHBOARD_DEFAULT_VIEW,
  DASHBOARD_SORT_OPTION,
  DASHBOARD_VIEW,
  type DashboardSortOption,
  type DashboardView,
} from '@/app/(dashboard)/_constants/dashboard';
import { SERVICE_STATUSES, ServiceStatus } from '@/types';

const defaultStatusFilters: ServiceStatus[] = [
  ...DASHBOARD_DEFAULT_STATUS_FILTERS,
];

function parseStatusFilters(value: string) {
  const parsed = value
    .split(',')
    .map((status) => status.trim().toUpperCase())
    .filter((status): status is ServiceStatus =>
      SERVICE_STATUSES.includes(status as ServiceStatus),
    );

  return parsed.length > 0 ? parsed : defaultStatusFilters;
}

function parseDashboardView(value: string): DashboardView {
  return value === DASHBOARD_VIEW.CARD || value === DASHBOARD_VIEW.TABLE
    ? value
    : DASHBOARD_DEFAULT_VIEW;
}

function parseSortOption(value: string): DashboardSortOption {
  return Object.values(DASHBOARD_SORT_OPTION).includes(
    value as DashboardSortOption,
  )
    ? (value as DashboardSortOption)
    : DASHBOARD_SORT_OPTION.NAME_ASC;
}

export function useDashboardState() {
  const [view, setViewParam] = useQueryState(
    'view',
    parseAsString.withDefault(DASHBOARD_DEFAULT_VIEW),
  );
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
  const [sortOptionParam, setSortOptionParam] = useQueryState(
    'sort',
    parseAsString.withDefault(DASHBOARD_SORT_OPTION.NAME_ASC),
  );

  const dashboardView = parseDashboardView(view);
  const sortOption = parseSortOption(sortOptionParam);

  const statusFilters = useMemo(
    () => parseStatusFilters(statusFilterParam),
    [statusFilterParam],
  );

  const resetCardPagination = useCallback(() => {
    void setCardPaginationState({ cardPageIndex: 0 });
  }, [setCardPaginationState]);

  const handleSearchChange = useCallback(
    (value: string) => {
      void setSearch(value);
      resetCardPagination();
    },
    [resetCardPagination, setSearch],
  );

  const handleViewChange = useCallback(
    (values: string[]) => {
      const nextView = values[0];

      if (
        nextView === DASHBOARD_VIEW.CARD ||
        nextView === DASHBOARD_VIEW.TABLE
      ) {
        void setViewParam(nextView);
        resetCardPagination();
      }
    },
    [resetCardPagination, setViewParam],
  );

  const handleSortOptionChange = useCallback(
    (sort: DashboardSortOption) => {
      void setSortOptionParam(sort);
      resetCardPagination();
    },
    [resetCardPagination, setSortOptionParam],
  );

  const handleStatusToggle = useCallback(
    (status: ServiceStatus) => {
      const next = statusFilters.includes(status)
        ? statusFilters.filter((filter) => filter !== status)
        : [...statusFilters, status];

      resetCardPagination();
      void setStatusFilterParam(
        (next.length > 0 ? next : defaultStatusFilters).join(','),
      );
    },
    [resetCardPagination, setStatusFilterParam, statusFilters],
  );

  const handleMetricFilterChange = useCallback(
    (filter: ServiceStatus | 'ALL') => {
      void setStatusFilterParam(
        (filter === 'ALL' ? defaultStatusFilters : [filter]).join(','),
      );
      resetCardPagination();
    },
    [resetCardPagination, setStatusFilterParam],
  );

  const handlePageIndexChange = useCallback(
    (updater: (prev: number) => number) => {
      const next = updater(cardPageIndex);
      void setCardPaginationState({ cardPageIndex: Math.max(0, next) });
    },
    [cardPageIndex, setCardPaginationState],
  );

  const handlePageSizeChange = useCallback(
    (size: number) => {
      void setCardPaginationState({
        cardPageSize: size,
        cardPageIndex: 0,
      });
    },
    [setCardPaginationState],
  );

  const handlePageSelect = useCallback(
    (page: number) => {
      void setCardPaginationState({ cardPageIndex: page });
    },
    [setCardPaginationState],
  );

  return {
    cardPageIndex,
    cardPageSize,
    dashboardView,
    handleMetricFilterChange,
    handlePageIndexChange,
    handlePageSelect,
    handlePageSizeChange,
    handleSearchChange,
    handleSortOptionChange,
    handleStatusToggle,
    handleViewChange,
    search,
    sortOption,
    statusFilters,
  };
}

export type DashboardState = ReturnType<typeof useDashboardState>;
