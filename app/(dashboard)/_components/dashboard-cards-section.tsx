import { Service } from '@/types';

import { CardsPaginationDesktop } from './cards-pagination-desktop';
import { CardsPaginationMobile } from './cards-pagination-mobile';
import { DashboardCardsGrid } from './dashboard-cards-grid';

export interface DashboardCardsSectionProps {
  services: Service[];
  totalResults: number;
  cardStart: number;
  cardPageSize: number;
  cardPageIndex: number;
  cardTotalPages: number;
  onPageIndexChange: (updater: (prev: number) => number) => void;
  onPageSizeChange: (size: number) => void;
  onPageSelect: (page: number) => void;
}

export function DashboardCardsSection({
  services,
  totalResults,
  cardStart,
  cardPageSize,
  cardPageIndex,
  cardTotalPages,
  onPageIndexChange,
  onPageSizeChange,
  onPageSelect,
}: DashboardCardsSectionProps) {
  return (
    <>
      <div className="block sm:hidden">
        <DashboardCardsGrid services={services} />

        {services.length > 0 && (
          <CardsPaginationMobile
            cardStart={cardStart}
            cardPageSize={cardPageSize}
            totalResults={totalResults}
            cardPageIndex={cardPageIndex}
            cardTotalPages={cardTotalPages}
            onPageIndexChange={onPageIndexChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </div>

      <div className="hidden sm:block">
        <DashboardCardsGrid services={services} />

        {services.length > 0 && (
          <CardsPaginationDesktop
            cardStart={cardStart}
            cardPageSize={cardPageSize}
            totalResults={totalResults}
            cardPageIndex={cardPageIndex}
            cardTotalPages={cardTotalPages}
            onPageIndexChange={onPageIndexChange}
            onPageSizeChange={onPageSizeChange}
            onPageSelect={onPageSelect}
          />
        )}
      </div>
    </>
  );
}
