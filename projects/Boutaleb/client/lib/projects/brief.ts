'use client';

import type { BriefView } from '@repo/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { projectKeys } from './queries';

export const briefKey = (projectId: string) => [...projectKeys.one(projectId), 'brief'] as const;

/** The project's one brief. A project with none answers state "none", never 404. */
export function useBrief(projectId: string) {
    const api = useApi();
    return useQuery({ queryKey: briefKey(projectId), queryFn: () => api<BriefView>(`/projects/${projectId}/brief`) });
}

type Act =
    | { kind: 'write'; answers: Record<string, string> }
    | { kind: 'approve' }
    | { kind: 'send-back'; reason: string }
    | { kind: 'reopen' }
    | { kind: 'note'; area: string; note: string };

/**
 * Every brief action, one mutation. The answer is the new brief, written
 * straight into the cache; the project is refetched too, because approving
 * can move it to Planning and the header must not disagree by one click.
 */
export function useBriefAct(projectId: string) {
    const api = useApi();
    const qc = useQueryClient();
    const base = `/projects/${projectId}/brief`;
    return useMutation({
        mutationFn: (a: Act) => {
            switch (a.kind) {
                case 'write':
                    return api<BriefView>(base, { method: 'PUT', body: JSON.stringify({ answers: a.answers }) });
                case 'send-back':
                    return api<BriefView>(`${base}/send-back`, { method: 'POST', body: JSON.stringify({ reason: a.reason }) });
                case 'note':
                    return api<BriefView>(`${base}/areas/${a.area}/note`, { method: 'PUT', body: JSON.stringify({ note: a.note }) });
                default:
                    return api<BriefView>(`${base}/${a.kind}`, { method: 'POST' });
            }
        },
        onSuccess: (b) => {
            qc.setQueryData(briefKey(projectId), b);
            void qc.invalidateQueries({ queryKey: projectKeys.one(projectId), exact: true });
            void qc.invalidateQueries({ queryKey: projectKeys.list() });
        },
    });
}
