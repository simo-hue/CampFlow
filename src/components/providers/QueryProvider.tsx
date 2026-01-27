'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Aggressive caching for settings by default or just high stale time
                        // We set a high default, but individual queries can override this if needed.
                        // Given the user wants "intelligent caching" specifically for settings which "never change",
                        // we'll set a reasonable default here (e.g., 5 minutes) and override for settings.
                        staleTime: 1000 * 60 * 5, // 5 minutes default
                        gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection
                        retry: 1,
                        refetchOnWindowFocus: false, // Don't refetch on window focus by default
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
