'use client';

import type { PortalLinkIssued, PortalLinkStatus } from '@repo/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { briefKey } from './brief';
import { clientKeys } from './create';
import { projectKeys } from './queries';

export const portalKey = (projectId: string) => [...projectKeys.one(projectId), 'portal-link'] as const;

/** Whether a link is live, when it went out and when the client last opened it. The link itself is never readable again. */
export function usePortalLink(projectId: string) {
    const api = useApi();
    return useQuery({ queryKey: portalKey(projectId), queryFn: () => api<PortalLinkStatus>(`/projects/${projectId}/portal-link`) });
}

/**
 * Issues a link (emailed, or just made to copy). The answer carries the link
 * once; the caller shows it and it is gone on the next render of the page.
 * The brief moves to "awaiting" and the client's contact log gains an entry,
 * so both are refetched.
 */
export function useIssueLink(projectId: string) {
    const api = useApi();
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (send: boolean) => api<PortalLinkIssued>(`/projects/${projectId}/portal-link`, { method: 'POST', body: JSON.stringify({ send }) }),
        onSuccess: ({ url: _url, sent: _sent, ...status }) => {
            qc.setQueryData(portalKey(projectId), status);
            void qc.invalidateQueries({ queryKey: briefKey(projectId) });
            void qc.invalidateQueries({ queryKey: clientKeys.all });
        },
    });
}
