'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

// One query client for the ERP. TanStack's own defaults stand (three
// retries, refetch on focus): the failed panel reports them as they are.
export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }));
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
