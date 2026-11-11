'use client';

import type { RoundView, RoundViewLink, UploadTicket } from '@repo/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { unzip } from 'fflate';
import { useState } from 'react';
import { useApi } from '@/lib/api';
import { bundleProblem, readBundle, type BundleProblem } from './bundle';
import { projectKeys } from './queries';

export const roundsKey = (projectId: string) => [...projectKeys.one(projectId), 'wireframes'] as const;

/** The rounds, newest first: the live one, then its history. */
export function useRounds(projectId: string) {
    const api = useApi();
    return useQuery({ queryKey: roundsKey(projectId), queryFn: () => api<RoundView[]>(`/projects/${projectId}/wireframes`) });
}

type Act =
    | { kind: 'start'; note: string | null }
    | { kind: 'send'; v: number }
    | { kind: 'verdict'; v: number; verdict: 'approved' | 'changes'; page: string | null; body: string };

/** Every change answers with the whole list, written straight into the cache. */
export function useRoundAct(projectId: string) {
    const api = useApi();
    const qc = useQueryClient();
    const base = `/projects/${projectId}/wireframes`;
    return useMutation({
        mutationFn: (a: Act) => {
            switch (a.kind) {
                case 'start':
                    return api<RoundView[]>(base, { method: 'POST', body: JSON.stringify({ note: a.note }) });
                case 'send':
                    return api<RoundView[]>(`${base}/${a.v}/send`, { method: 'POST' });
                case 'verdict':
                    return api<RoundView[]>(`${base}/${a.v}/verdict`, { method: 'POST', body: JSON.stringify({ verdict: a.verdict, page: a.page, body: a.body }) });
            }
        },
        onSuccess: (rows) => qc.setQueryData(roundsKey(projectId), rows),
    });
}

/** Where an upload is. `sent` / `of` count files, so the screen can say "12 of 30". */
export type UploadStep = { at: 'reading' } | { at: 'sending'; sent: number; of: number } | { at: 'reading-pages' };

export class BundleError extends Error {
    constructor(readonly problem: BundleProblem | 'unreadable' | 'storage') {
        super(problem);
        this.name = 'BundleError';
    }
}

const unzipAsync = (data: Uint8Array) =>
    new Promise<Record<string, Uint8Array>>((ok, fail) => unzip(data, (err, out) => (err ? fail(new BundleError('unreadable')) : ok(out))));

/** Four at a time: enough to fill a home connection, few enough not to trip a storage rate limit. */
async function eachLimited<T>(items: T[], n: number, run: (item: T) => Promise<void>) {
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
        while (i < items.length) await run(items[i++]!);
    }));
}

/**
 * Upload a zip as a round's working folder: unzip here, ask the API for one
 * pre-signed PUT per file, send each straight to storage, then commit. A
 * failure anywhere leaves the round's current folder as it was: the upload
 * went to a fresh prefix and only commit points the round at it.
 */
export function useRoundUpload(projectId: string) {
    const api = useApi();
    const qc = useQueryClient();
    const [step, setStep] = useState<UploadStep | null>(null);
    const [skipped, setSkipped] = useState<string[]>([]);
    const m = useMutation({
        mutationFn: async ({ v, file }: { v: number; file: File }) => {
            setStep({ at: 'reading' });
            const bundle = readBundle(await unzipAsync(new Uint8Array(await file.arrayBuffer())));
            const problem = bundleProblem(bundle);
            if (problem) throw new BundleError(problem);
            setSkipped(bundle.skipped);
            const base = `/projects/${projectId}/wireframes/${v}`;
            const ticket = await api<UploadTicket>(`${base}/upload`, {
                method: 'POST',
                body: JSON.stringify({ files: bundle.files.map((f) => ({ path: f.path, size: f.data.byteLength })) }),
            });
            const data = new Map(bundle.files.map((f) => [f.path, f.data]));
            let sent = 0;
            setStep({ at: 'sending', sent, of: ticket.files.length });
            await eachLimited(ticket.files, 4, async (t) => {
                const res = await fetch(t.url, { method: 'PUT', headers: t.headers, body: data.get(t.path) as BodyInit });
                if (!res.ok) throw new BundleError('storage');
                setStep({ at: 'sending', sent: ++sent, of: ticket.files.length });
            });
            setStep({ at: 'reading-pages' });
            return api<RoundView[]>(`${base}/upload/commit`, { method: 'POST', body: JSON.stringify({ uploadId: ticket.uploadId, name: file.name }) });
        },
        onSuccess: (rows) => qc.setQueryData(roundsKey(projectId), rows),
        onSettled: () => setStep(null),
    });
    return { ...m, step, skipped };
}

/**
 * Open one of a round's pages in a new tab. The tab is opened FIRST, inside
 * the click, and pointed at the page once the signed address arrives:
 * opening it after an await is what popup blockers exist to stop.
 */
export function useOpenPage(projectId: string) {
    const api = useApi();
    return async (v: number, file: string) => {
        const w = window.open('about:blank', '_blank');
        try {
            const link = await api<RoundViewLink>(`/projects/${projectId}/wireframes/${v}/view`, { method: 'POST' });
            if (w) {
                w.opener = null;
                w.location.href = link.base + file.split('/').map(encodeURIComponent).join('/');
            }
        } catch {
            w?.close();
        }
    };
}
