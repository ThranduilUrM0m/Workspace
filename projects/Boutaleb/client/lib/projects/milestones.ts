'use client';

import type { MilestoneView } from '@repo/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { projectKeys } from './queries';

export const milestonesKey = (projectId: string) => [...projectKeys.one(projectId), 'milestones'] as const;

/** The plan's phases, in the owner's order. */
export function useMilestones(projectId: string) {
    const api = useApi();
    return useQuery({ queryKey: milestonesKey(projectId), queryFn: () => api<MilestoneView[]>(`/projects/${projectId}/milestones`) });
}

type Act =
    | { kind: 'add'; name: string; due: string | null }
    | { kind: 'edit'; id: string; name: string; due: string | null }
    | { kind: 'done'; id: string; done: boolean }
    | { kind: 'move'; id: string; direction: 'up' | 'down' }
    | { kind: 'remove'; id: string };

/** Every plan change answers with the whole ordered list, written straight into the cache. */
export function useMilestoneAct(projectId: string) {
    const api = useApi();
    const qc = useQueryClient();
    const base = `/projects/${projectId}/milestones`;
    return useMutation({
        mutationFn: (a: Act) => {
            switch (a.kind) {
                case 'add':
                    return api<MilestoneView[]>(base, { method: 'POST', body: JSON.stringify({ name: a.name, due: a.due }) });
                case 'edit':
                    return api<MilestoneView[]>(`${base}/${a.id}`, { method: 'PATCH', body: JSON.stringify({ name: a.name, due: a.due }) });
                case 'done':
                    return api<MilestoneView[]>(`${base}/${a.id}`, { method: 'PATCH', body: JSON.stringify({ done: a.done }) });
                case 'move':
                    return api<MilestoneView[]>(`${base}/${a.id}/move`, { method: 'POST', body: JSON.stringify({ direction: a.direction }) });
                case 'remove':
                    return api<MilestoneView[]>(`${base}/${a.id}`, { method: 'DELETE' });
            }
        },
        onSuccess: (rows) => qc.setQueryData(milestonesKey(projectId), rows),
    });
}
