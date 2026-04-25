'use client';

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useMemo, useState } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { makeQueryClient } from '@/lib/query-client';

const STORAGE_KEY = 'REACT_QUERY_OFFLINE_CACHE';
const MAX_AGE = 24 * 60 * 60 * 1000;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());
  const persister = useMemo(
    () => {
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
    },
    [],
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: MAX_AGE }}
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
