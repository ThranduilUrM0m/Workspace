'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

// The ERP's one way to the API. The browser calls the Nest server directly
// with the Clerk session token as a Bearer (the server lets exactly this
// origin in, CORS in server/src/app.ts). getToken() refreshes the
// short-lived token itself, so every call asks for it.

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4002';

/** A refusal from the API, with its status and the `{ error, fields }` body. */
export class ApiError extends Error {
    constructor(
        readonly status: number,
        readonly body: unknown,
    ) {
        super(`API answered ${status}`);
        this.name = 'ApiError';
    }
}

/** 404: the record does not exist (or the id is malformed). QueryGate shows Not found. */
export const isNotFound = (e: unknown) => e instanceof ApiError && e.status === 404;

/** 403: signed in, but the role does not reach this section. QueryGate says so instead of "did not load". */
export const isForbidden = (e: unknown) => e instanceof ApiError && e.status === 403;

/**
 * Retry the network and the server's own failures; never a refusal. A 403
 * or a 404 asked again three times is the same answer three times slower.
 */
export const shouldRetry = (failures: number, e: unknown) => !(e instanceof ApiError && e.status < 500) && failures < 3;

export type Api = <T>(path: string, init?: RequestInit) => Promise<T>;

export function useApi(): Api {
    const { getToken } = useAuth();
    return useCallback(
        async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
            const token = await getToken();
            const res = await fetch(`${API_URL}${path}`, {
                ...init,
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
                    ...init.headers,
                },
            });
            if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null));
            return (await res.json()) as T;
        },
        [getToken],
    );
}
