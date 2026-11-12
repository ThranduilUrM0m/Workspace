'use client';

import { createMongoAbility, type MongoAbility, type RawRuleOf } from '@casl/ability';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useApi } from '@/lib/api';

// Who the API thinks is calling, and what their role lets them do
// (server auth/me.controller.ts). The rules are the server's own CASL
// rules, rebuilt here with the same library, so "can they open Finance"
// has exactly one meaning on both sides. This only decides what to SHOW:
// every request is checked again on the server.

type Action = 'view' | 'edit' | 'issueInvoices' | 'publishContent' | 'manage';
type Subject = string;
export type ClientAbility = MongoAbility<[Action, Subject]>;

export interface Me {
    userId: string;
    sessionId: string | null;
    member: { id: string; name: string; email: string };
    role: { id: string; name: string; owner: boolean };
    rules: RawRuleOf<ClientAbility>[];
}

export const meKey = ['me'] as const;

/** The caller's member, role and rules. A role changes rarely; a page change does not refetch it. */
export function useMe() {
    const api = useApi();
    return useQuery({ queryKey: meKey, queryFn: () => api<Me>('/me'), staleTime: 5 * 60_000 });
}

/** The caller's ability, or null while /me is unknown (loading, or it failed). */
export function useAbility(): ClientAbility | null {
    const rules = useMe().data?.rules;
    return useMemo(() => (rules ? createMongoAbility<ClientAbility>(rules) : null), [rules]);
}
