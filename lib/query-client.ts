import { QueryClient } from '@tanstack/react-query';

import { QUERY_CACHE_MAX_AGE_MS } from '@/constants/query-cache';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 20_000,
        gcTime: QUERY_CACHE_MAX_AGE_MS,
      },
    },
  });
}
