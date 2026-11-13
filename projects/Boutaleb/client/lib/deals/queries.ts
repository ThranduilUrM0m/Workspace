'use client';

import type { DealCreate, DealView } from '@repo/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { clientKeys } from '@/lib/projects/create';

export const dealKeys = {
    all: ['deals'] as const,
    list: () => [...dealKeys.all, 'list'] as const,
    one: (id: string) => [...dealKeys.all, 'one', id] as const,
};

/** The whole funnel, closed deals included: the list folds them. A door (?stage) filters on screen, not here, so the rail still sees everything. */
export function useDeals() {
    const api = useApi();
    return useQuery({ queryKey: dealKeys.list(), queryFn: () => api<DealView[]>('/deals') });
}

/** One deal. An unknown or malformed id answers 404, which QueryGate shows as Not found. */
export function useDeal(id: string) {
    const api = useApi();
    return useQuery({
        queryKey: dealKeys.one(id),
        queryFn: () => api<DealView>(`/deals/${encodeURIComponent(id)}`),
    });
}

export function useCreateDeal() {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Omit<DealCreate, 'value'> & { value?: number | null }) =>
            api<DealView>('/deals', { method: 'POST', body: JSON.stringify(body) }),
        onSuccess: (d) => {
            qc.setQueryData(dealKeys.one(d.id), d);
            void qc.invalidateQueries({ queryKey: dealKeys.list() });
            void qc.invalidateQueries({ queryKey: clientKeys.all });
        },
    });
}

export function useLoseDeal(id: string) {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (lostWhy: string) =>
            api<DealView>(`/deals/${encodeURIComponent(id)}/lose`, {
                method: 'POST',
                body: JSON.stringify({ lostWhy }),
            }),
        onSuccess: (d) => {
            qc.setQueryData(dealKeys.one(d.id), d);
            void qc.invalidateQueries({ queryKey: dealKeys.list() });
        },
    });
}
