import { getCardPaginationView } from '@/app/(dashboard)/_libs/get-dashboard-services-view';
import { Service } from '@/types';

import { CardsPaginationDesktop } from './cards-pagination-desktop';
import { CardsPaginationMobile } from './cards-pagination-mobile';
import { DashboardCardsGrid } from './dashboard-cards-grid';
import { useDashboardStateContext } from './dashboard-state-provider';

export interface DashboardCardsSectionProps {
  services: Service[];
  paginationViewport: 'mobile' | 'desktop';
}

export function DashboardCardsSection({
  services,
  paginationViewport,
}: DashboardCardsSectionProps) {
  const { cardPageIndex, cardPageSize, sortOption } =
    useDashboardStateContext();
  const { cardStart, cardTotalPages, paginatedCards, totalCardResults } =
    getCardPaginationView({
      services,
      sortOption,
      cardPageIndex,
      cardPageSize,
    });

  const pagination =
    paginatedCards.length > 0 ? (
      paginationViewport === 'mobile' ? (
        <CardsPaginationMobile
          cardStart={cardStart}
          totalResults={totalCardResults}
          cardTotalPages={cardTotalPages}
        />
      ) : (
        <CardsPaginationDesktop
          cardStart={cardStart}
          totalResults={totalCardResults}
          cardTotalPages={cardTotalPages}
        />
      )
    ) : null;

  return (
    <>
      <DashboardCardsGrid services={paginatedCards} />
      {pagination}
    </>
  );
}
