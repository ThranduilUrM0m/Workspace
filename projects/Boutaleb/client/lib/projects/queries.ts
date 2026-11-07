'use client';

import type { ProjectView } from '@repo/schemas';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

export const projectKeys = {
    all: ['projects'] as const,
    list: () => [...projectKeys.all, 'list'] as const,
};

/** Every live project (not archived; Completed included, the list folds it). */
export function useProjects() {
    const api = useApi();
    return useQuery({ queryKey: projectKeys.list(), queryFn: () => api<ProjectView[]>('/projects') });
}
