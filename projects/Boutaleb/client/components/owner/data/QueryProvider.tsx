'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { shouldRetry } from '@/lib/api';

// One query client for the ERP. TanStack's defaults stand (three retries,
// refetch on focus) except that a refusal (4xx) is never retried: the
// failed panel reports the real attempt count either way.
export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: shouldRetry } } }));
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
