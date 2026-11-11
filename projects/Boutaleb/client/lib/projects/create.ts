'use client';

import type { ClientCreate, ClientPick, ProjectCreate, ProjectView } from '@repo/schemas';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiError, useApi } from '@/lib/api';
import { projectKeys } from './queries';

export const clientKeys = {
    all: ['clients'] as const,
    search: (q: string) => [...clientKeys.all, 'search', q] as const,
};

/** The value, once it has stopped changing for `ms`: one request per pause, not per keystroke. */
export function useSettled<T>(value: T, ms = 200): T {
    const [settled, setSettled] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setSettled(value), ms);
        return () => clearTimeout(t);
    }, [value, ms]);
    return settled;
}

/** Clients by name, company or email; the newest first when q is empty. */
export function useClientSearch(q: string, enabled = true) {
    const api = useApi();
    const settled = useSettled(q.trim());
    return useQuery({
        queryKey: clientKeys.search(settled),
        queryFn: () => api<ClientPick[]>(`/clients${settled ? `?q=${encodeURIComponent(settled)}` : ''}`),
        placeholderData: keepPreviousData,
        enabled,
    });
}

/** The server's 409 for an address that already has a client: it names that client. */
export function clashOf(err: unknown): ClientPick | null {
    if (!(err instanceof ApiError) || err.status !== 409) return null;
    const body = err.body as { fields?: { email?: string }; client?: ClientPick } | null;
    return body?.fields?.email === 'taken' && body.client ? body.client : null;
}

export function slugTaken(err: unknown): boolean {
    if (!(err instanceof ApiError) || err.status !== 409) return false;
    return (err.body as { fields?: { slug?: string } } | null)?.fields?.slug === 'taken';
}

export function useCreateClient() {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ClientCreate) => api<ClientPick>('/clients', { method: 'POST', body: JSON.stringify(body) }),
        onSuccess: () => qc.invalidateQueries({ queryKey: clientKeys.all }),
    });
}

export function useCreateProject() {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ProjectCreate) => api<ProjectView>('/projects', { method: 'POST', body: JSON.stringify(body) }),
        onSuccess: (p) => {
            qc.setQueryData(projectKeys.one(p.id), p);
            return qc.invalidateQueries({ queryKey: projectKeys.list() });
        },
    });
}
