import dynamic from 'next/dynamic';

import { DASHBOARD_VIEW } from '@/app/(dashboard)/_constants/dashboard';
import {
  getCardPaginationView,
  getFilteredServices,
} from '@/app/(dashboard)/_libs/get-dashboard-services-view';
import { Service } from '@/types';

import { DashboardCardsSection } from './dashboard-cards-section';
import { useDashboardStateContext } from './dashboard-state-provider';
import { EmptyServices } from './empty-services';
import { TableSkeleton } from './table-skeleton';

const ServiceTable = dynamic(
  () => import('./service-table').then((m) => m.ServiceTable),
  { loading: () => <TableSkeleton rows={4} /> },
);

interface DashboardMainContentProps {
  services: Service[];
}

export function DashboardMainContent({ services }: DashboardMainContentProps) {
  const {
    cardPageIndex,
    cardPageSize,
    dashboardView,
    search,
    sortOption,
    statusFilters,
  } = useDashboardStateContext();
  const filteredServices = getFilteredServices({
    services,
    search,
    statusFilters,
  });
  const { cardStart, cardTotalPages, paginatedCards, totalCardResults } =
    getCardPaginationView({
      services: filteredServices,
      sortOption,
      cardPageIndex,
      cardPageSize,
    });

  if (services.length === 0) {
    return <EmptyServices />;
  }

  const renderCardsSection = (paginationViewport: 'mobile' | 'desktop') => (
    <DashboardCardsSection
      services={paginatedCards}
      totalResults={totalCardResults}
      cardStart={cardStart}
      cardTotalPages={cardTotalPages}
      paginationViewport={paginationViewport}
    />
  );

  return (
    <>
      <div className="block sm:hidden">{renderCardsSection('mobile')}</div>

      <div className="hidden sm:block">
        {dashboardView === DASHBOARD_VIEW.CARD ? (
          renderCardsSection('desktop')
        ) : (
          <ServiceTable services={filteredServices} />
        )}
      </div>
    </>
  );
}
