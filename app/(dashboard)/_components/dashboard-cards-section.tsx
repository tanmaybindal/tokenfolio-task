import { Service } from '@/types';

import { CardsPaginationDesktop } from './cards-pagination-desktop';
import { CardsPaginationMobile } from './cards-pagination-mobile';
import { DashboardCardsGrid } from './dashboard-cards-grid';

export interface DashboardCardsSectionProps {
  services: Service[];
  totalResults: number;
  cardStart: number;
  cardTotalPages: number;
  paginationViewport: 'mobile' | 'desktop';
}

export function DashboardCardsSection({
  services,
  totalResults,
  cardStart,
  cardTotalPages,
  paginationViewport,
}: DashboardCardsSectionProps) {
  const pagination =
    services.length > 0 ? (
      paginationViewport === 'mobile' ? (
        <CardsPaginationMobile
          cardStart={cardStart}
          totalResults={totalResults}
          cardTotalPages={cardTotalPages}
        />
      ) : (
        <CardsPaginationDesktop
          cardStart={cardStart}
          totalResults={totalResults}
          cardTotalPages={cardTotalPages}
        />
      )
    ) : null;

  return (
    <>
      <DashboardCardsGrid services={services} />
      {pagination}
    </>
  );
}
