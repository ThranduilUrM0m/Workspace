'use client';

import type {
    ClientEdit,
    ClientNew,
    ClientRow,
    ContactCreate,
    ContactView,
    RecentContact,
} from '@repo/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { dealKeys } from '@/lib/deals/queries';
import { clientKeys } from '@/lib/projects/create';
import { projectKeys } from '@/lib/projects/queries';

// The Clients screens' reads and writes. Keys hang off clientKeys.all, so
// anything that writes a client (New project, Log an enquiry) refreshes
// these too.
export const clientRows = {
    list: () => [...clientKeys.all, 'list'] as const,
    one: (id: string) => [...clientKeys.all, 'one', id] as const,
    log: (id: string) => [...clientKeys.all, 'log', id] as const,
    recent: () => [...clientKeys.all, 'recent'] as const,
};

export function useRecentContacts() {
    const api = useApi();
    return useQuery({
        queryKey: clientRows.recent(),
        queryFn: () => api<RecentContact[]>('/clients/recent-contacts'),
    });
}

export function useClients() {
    const api = useApi();
    return useQuery({ queryKey: clientRows.list(), queryFn: () => api<ClientRow[]>('/clients') });
}

export function useClient(id: string, enabled = true) {
    const api = useApi();
    return useQuery({
        queryKey: clientRows.one(id),
        queryFn: () => api<ClientRow>(`/clients/${encodeURIComponent(id)}`),
        enabled,
    });
}

export function useContacts(id: string) {
    const api = useApi();
    return useQuery({
        queryKey: clientRows.log(id),
        queryFn: () => api<ContactView[]>(`/clients/${encodeURIComponent(id)}/contacts`),
    });
}

export function useNewClient() {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ClientNew) =>
            api<ClientRow>('/clients', { method: 'POST', body: JSON.stringify(body) }),
        onSuccess: (c) => {
            qc.setQueryData(clientRows.one(c.id), c);
            void qc.invalidateQueries({ queryKey: clientKeys.all });
        },
    });
}

/** Edit client. Projects and deals carry the client's name and language, so they refresh too. */
export function useEditClient(id: string) {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ClientEdit) =>
            api<ClientRow>(`/clients/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                body: JSON.stringify(body),
            }),
        onSuccess: (c) => {
            qc.setQueryData(clientRows.one(c.id), c);
            void qc.invalidateQueries({ queryKey: clientKeys.all });
            void qc.invalidateQueries({ queryKey: projectKeys.all });
            void qc.invalidateQueries({ queryKey: dealKeys.all });
        },
    });
}

/** Log contact. Answers with the whole history, so the tab redraws from the server's order. */
export function useLogContact(id: string) {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: ContactCreate) =>
            api<ContactView[]>(`/clients/${encodeURIComponent(id)}/contacts`, {
                method: 'POST',
                body: JSON.stringify(body),
            }),
        onSuccess: (log) => {
            qc.setQueryData(clientRows.log(id), log);
            void qc.invalidateQueries({ queryKey: clientRows.one(id) });
            void qc.invalidateQueries({ queryKey: clientRows.list() });
            void qc.invalidateQueries({ queryKey: clientRows.recent() });
        },
    });
}
