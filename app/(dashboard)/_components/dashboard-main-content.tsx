import dynamic from 'next/dynamic';

import {
  DASHBOARD_SORT_OPTION,
  DASHBOARD_VIEW,
  type DashboardSortOption,
  type DashboardView,
} from '@/app/(dashboard)/_constants/dashboard';
import { Service, ServiceStatus } from '@/types';

import { DashboardCardsSection } from './dashboard-cards-section';
import { EmptyServices } from './empty-services';
import { TableSkeleton } from './table-skeleton';

const ServiceTable = dynamic(
  () => import('./service-table').then((m) => m.ServiceTable),
  { loading: () => <TableSkeleton rows={4} /> },
);

interface DashboardMainContentProps {
  services: Service[];
  search: string;
  view: DashboardView;
  sortOption: DashboardSortOption;
  statusFilters: ServiceStatus[];
  cardPageSize: number;
  cardPageIndex: number;
  onPageIndexChange: (updater: (prev: number) => number) => void;
  onPageSizeChange: (size: number) => void;
  onPageSelect: (page: number) => void;
  onRefresh: () => void;
  onAddService: () => void;
}

export function DashboardMainContent({
  services,
  search,
  view,
  sortOption,
  statusFilters,
  cardPageSize,
  cardPageIndex,
  onPageIndexChange,
  onPageSizeChange,
  onPageSelect,
  onRefresh,
  onAddService,
}: DashboardMainContentProps) {
  const normalizedSearch = search.trim().toLowerCase();
  const searchedServices = normalizedSearch
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(normalizedSearch) ||
          s.url.toLowerCase().includes(normalizedSearch),
      )
    : services;
  const filteredServices =
    statusFilters.length > 0
      ? searchedServices.filter((s) => statusFilters.includes(s.status))
      : searchedServices;

  const sortedCardServices = [...filteredServices].sort((a, b) => {
    switch (sortOption) {
      case DASHBOARD_SORT_OPTION.NAME_DESC:
        return b.name.localeCompare(a.name);
      case DASHBOARD_SORT_OPTION.HEALTH_DESC:
        return (b.healthScore ?? -1) - (a.healthScore ?? -1);
      case DASHBOARD_SORT_OPTION.LATENCY_ASC:
        return (
          (a.latencyMs ?? Number.MAX_SAFE_INTEGER) -
          (b.latencyMs ?? Number.MAX_SAFE_INTEGER)
        );
      case DASHBOARD_SORT_OPTION.NAME_ASC:
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const cardTotalPages = Math.max(
    1,
    Math.ceil(sortedCardServices.length / cardPageSize),
  );
  const cardStart = cardPageIndex * cardPageSize;
  const paginatedCards = sortedCardServices.slice(
    cardStart,
    cardStart + cardPageSize,
  );

  if (services.length === 0) {
    return <EmptyServices onAdd={onAddService} />;
  }

  const cardsSection = (
    <DashboardCardsSection
      services={paginatedCards}
      totalResults={sortedCardServices.length}
      cardStart={cardStart}
      cardPageSize={cardPageSize}
      cardPageIndex={cardPageIndex}
      cardTotalPages={cardTotalPages}
      onPageIndexChange={onPageIndexChange}
      onPageSizeChange={onPageSizeChange}
      onPageSelect={onPageSelect}
    />
  );

  return (
    <>
      <div className="block sm:hidden">{cardsSection}</div>

      <div className="hidden sm:block">
        {view === DASHBOARD_VIEW.CARD ? (
          cardsSection
        ) : (
          <ServiceTable services={filteredServices} onRefresh={onRefresh} />
        )}
      </div>
    </>
  );
}
