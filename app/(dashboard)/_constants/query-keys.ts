import type { QueryKey } from '@tanstack/react-query';

/** Shared cache key so queries and mutations update the same list. */
export const GET_SERVICES_QUERY_KEY = ['services'] as const satisfies QueryKey;
