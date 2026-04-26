import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { Dashboard } from '@/app/(dashboard)/_components/dashboard';
import { getServicesQueryOptions } from '@/app/(dashboard)/_hooks/get-services';
import { makeQueryClient } from '@/lib/query-client';
import { readServices } from '@/lib/storage';

export default async function Page() {
  const queryClient = makeQueryClient();
  const { services } = await readServices();

  await queryClient.prefetchQuery(getServicesQueryOptions(services));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  );
}
