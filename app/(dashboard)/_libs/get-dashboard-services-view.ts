import {
  DASHBOARD_SORT_OPTION,
  type DashboardSortOption,
} from '@/app/(dashboard)/_constants/dashboard';
import { Service, ServiceStatus } from '@/types';

interface GetCardPaginationViewOptions {
  services: Service[];
  cardPageIndex: number;
  cardPageSize: number;
}

interface GetFilteredServicesOptions {
  services: Service[];
  search: string;
  statusFilters: ServiceStatus[];
}

export function getFilteredServices({
  services,
  search,
  statusFilters,
}: GetFilteredServicesOptions) {
  const normalizedSearch = search.trim().toLowerCase();
  const searchedServices = normalizedSearch
    ? services.filter(
        (service) =>
          service.name.toLowerCase().includes(normalizedSearch) ||
          service.url.toLowerCase().includes(normalizedSearch),
      )
    : services;
  const filteredServices =
    statusFilters.length > 0
      ? searchedServices.filter((service) =>
          statusFilters.includes(service.status),
        )
      : searchedServices;

  return filteredServices;
}

export function getCardPaginationView({
  services,
  sortOption,
  cardPageIndex,
  cardPageSize,
}: GetCardPaginationViewOptions & { sortOption: DashboardSortOption }) {
  const sortedCardServices = [...services].sort((a, b) => {
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

  return {
    cardStart,
    cardTotalPages,
    paginatedCards,
    totalCardResults: sortedCardServices.length,
  };
}
