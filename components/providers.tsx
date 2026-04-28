'use client';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useMemo, useState } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QUERY_CACHE_MAX_AGE_MS } from '@/constants/query-cache';
import { makeQueryClient } from '@/lib/query-client';

const STORAGE_KEY = 'REACT_QUERY_OFFLINE_CACHE';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const persister = useMemo(() => {
    const storage =
      typeof window !== 'undefined'
        ? {
            getItem: async (key: string) => window.localStorage.getItem(key),
            setItem: async (key: string, value: string) => {
              window.localStorage.setItem(key, value);
            },
            removeItem: async (key: string) => {
              window.localStorage.removeItem(key);
            },
          }
        : {
            getItem: async () => null,
            setItem: async () => {},
            removeItem: async () => {},
          };

    return createAsyncStoragePersister({
      key: STORAGE_KEY,
      storage,
    });
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: QUERY_CACHE_MAX_AGE_MS }}
        >
          <TooltipProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </PersistQueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
