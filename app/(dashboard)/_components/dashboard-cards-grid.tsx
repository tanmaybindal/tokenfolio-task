import { Service } from '@/types';

import { ServiceCard } from './service-card';

interface DashboardCardsGridProps {
  services: Service[];
  onRefresh: () => void;
}

export function DashboardCardsGrid({
  services,
  onRefresh,
}: DashboardCardsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} onRefresh={onRefresh} />
      ))}
    </div>
  );
}
