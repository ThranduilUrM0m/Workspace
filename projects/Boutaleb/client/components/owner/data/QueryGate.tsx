'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { NavIcon } from '@/components/owner/shell/icons';
import { isForbidden, isNotFound } from '@/lib/api';
import { atTime, Loading, OFFLINE, Skel } from './states';

// C19 QueryGate: four states, mapped 1:1 onto TanStack (component-map C19).
//   pending, or retrying after a failure  -> skeleton of `kind`
//   error with a 404                      -> Not found (records)
//   error with a 403                      -> No access (the role stops here)
//   other error                           -> Failed panel, real attempt count
//   data passes isEmpty                   -> the screen's own Empty
//   else                                  -> children(data)
// The skeleton is the real layout classes with bars inside, so each
// breakpoint keeps its shape and nothing jumps when the data lands. The
// primary action stays live while loading. Gate the widget, not the route:
// a partial failure never blanks a screen.

export interface QueryGateProps<T> {
    query: UseQueryResult<T>;
    kind: 'list' | 'rec';
    /** The data, named in the copy: "projects". */
    what: string;
    /** One of them, for Not found: "project". */
    one?: string;
    /** Where Not found sends you back to. */
    back?: string;
    isEmpty?: (data: T) => boolean;
    empty?: ReactNode;
    /** The screen's primary action, drawn live inside the skeleton too. */
    action?: ReactNode;
    /** A record's tab labels: words, not data, so the skeleton prints them. */
    tabs?: string[];
    className?: string;
    children: (data: T) => ReactNode;
}

export function QueryGate<T>({ query, kind, what, one = 'record', back, isEmpty, empty, action, tabs, className, children }: QueryGateProps<T>) {
    const loading = query.isPending || (query.isError && query.isFetching);
    let body: ReactNode;
    if (loading) {
        body = (
            <>
                <Loading what={what} />
                {SKELETONS[kind]({ action, tabs })}
            </>
        );
    } else if (query.isError && isNotFound(query.error)) {
        body = <NotFound what={what} one={one} back={back} />;
    } else if (query.isError && isForbidden(query.error)) {
        body = <NoAccess what={what} />;
    } else if (query.isError) {
        body = <Failed what={what} tries={query.failureCount} at={query.errorUpdatedAt} retry={() => void query.refetch()} />;
    } else if (isEmpty?.(query.data as T)) {
        body = empty;
    } else {
        body = children(query.data as T);
    }
    return (
        <div className={className} aria-busy={loading || undefined}>
            {body}
        </div>
    );
}

/**
 * Failed: says WHAT did not arrive, that nothing saved is lost (the fear a
 * failure raises), and offers one action. The automatic retries already
 * happened and the line under the button says so, with real values.
 */
export function Failed({ what, tries, at, retry }: { what: string; tries: number; at: number; retry: () => void }) {
    return (
        <div className="b-fail" role="alert">
            <span className="b-fail-ic">{OFFLINE}</span>
            <div>
                <h2 className="b-fail-t">The {what} did not load</h2>
                <p className="b-fail-s">The server did not answer. Nothing already saved is lost.</p>
            </div>
            <div className="b-fail-act">
                <button type="button" className="btn-solid" onClick={retry}>
                    Try again
                </button>
                {tries > 0 && (
                    <span className="b-fail-when">
                        Tried {tries} time{tries === 1 ? '' : 's'} · last at {atTime(at)}
                    </span>
                )}
            </div>
        </div>
    );
}

/** A record address that leads nowhere: names the way back to its list. */
export function NotFound({ what, one, back }: { what: string; one: string; back?: string }) {
    return (
        <div className="b-fail b-fail--gone" role="status">
            <span className="b-fail-ic">
                <NavIcon name="search" />
            </span>
            <div>
                <h2 className="b-fail-t">This {one} does not exist</h2>
                <p className="b-fail-s">It was deleted, merged into another, or the link is mistyped. Deletions are listed in Settings › Activity.</p>
            </div>
            {back && (
                <div className="b-fail-act">
                    <Link className="btn-solid" href={back}>
                        All {what}
                    </Link>
                </div>
            )}
        </div>
    );
}

/**
 * The server answered, and the answer is no: the member's role has no level
 * on this section. Not a failure, so no retry; it names who can change it.
 * (The nav hides such sections once it reads /me; a typed URL still lands here.)
 */
export function NoAccess({ what }: { what: string }) {
    return (
        <div className="b-fail b-fail--gone" role="status">
            <span className="b-fail-ic">{LOCK}</span>
            <div>
                <h2 className="b-fail-t">No access to {what}</h2>
                <p className="b-fail-s">Your role does not include this section. The owner can grant it in Settings › People.</p>
            </div>
            <div className="b-fail-act">
                <Link className="btn-solid" href="/app">
                    Dashboard
                </Link>
            </div>
        </div>
    );
}

const LOCK = (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="4" y="9" width="12" height="8.5" />
        <path d="M6.75 9V6.5a3.25 3.25 0 0 1 6.5 0V9" />
    </svg>
);

/* ---------- skeletons ---------- */

/** Widths vary per row on purpose: identical bars read as a pattern, not as content coming. */
const ROWS: [number, number][] = [
    [46, 30],
    [58, 24],
    [38, 34],
    [52, 20],
    [42, 28],
    [60, 26],
];

function ListSkeleton({ action }: { action?: ReactNode }) {
    const stat = (i: number) => (
        <div className="stat" key={i}>
            <Skel w="4.5rem" h=".5rem" />
            <Skel w={['6rem', '5rem', '7rem', '5.5rem'][i % 4]} h="1.125rem" />
            <Skel w="4rem" h=".5rem" />
        </div>
    );
    const row = ([a, b]: [number, number], i: number) => (
        <div className="b-list-row b-skel-row" key={i}>
            <div className="b-list-id">
                <Skel w={`${a}%`} h=".8125rem" />
                <Skel w={`${b}%`} h=".5625rem" />
            </div>
            <div className="b-list-clock">
                <Skel w="4.5rem" />
            </div>
            <div className="b-list-work">
                <Skel w="3.5rem" />
            </div>
            <div className="b-list-money">
                <Skel w="5rem" />
            </div>
            <div>
                <Skel w="4rem" />
            </div>
        </div>
    );
    const group = (n: number) => (
        <div className="b-list-group">
            <div className="b-list-gh b-skel-gh">
                <Skel w="6rem" />
            </div>
            {ROWS.slice(0, n).map(row)}
        </div>
    );
    const feed = (
        <section>
            <Skel w="5rem" h=".5625rem" />
            <div className="b-skel-feed">
                {[70, 55, 80].map((w) => (
                    <span key={w}>
                        <Skel w={`${w}%`} />
                        <Skel w="40%" h=".5rem" />
                    </span>
                ))}
            </div>
        </section>
    );
    return (
        <>
            <div className="b-list-strip b-skel-strip">
                <span className="b-skel-stats" aria-hidden="true">
                    {[0, 1, 2, 3].map(stat)}
                </span>
                {action}
            </div>
            <div className="b-list-cols" aria-hidden="true">
                <div>
                    {group(4)}
                    {group(2)}
                </div>
                <aside className="b-rail">
                    {feed}
                    {feed}
                </aside>
            </div>
        </>
    );
}

/** The record: header (avatar, name, four stats), the real tab words, sections and a rail. */
function RecSkeleton({ tabs = [] }: { tabs?: string[] }) {
    const stat = (i: number) => (
        <div className="stat" key={i}>
            <Skel w="4rem" h=".5rem" />
            <Skel w={['5.5rem', '4.5rem', '6rem', '5rem'][i]!} h="1rem" />
        </div>
    );
    const sec = (n: number, w: number[], key: string) => (
        <section className="b-skel-sec" key={key}>
            <Skel w="7rem" h=".5625rem" />
            {Array.from({ length: n }, (_, i) => (
                <span className="b-skel-line" key={i}>
                    <Skel w={`${w[i % w.length]}%`} h=".75rem" />
                    <Skel w="3.5rem" h=".625rem" />
                </span>
            ))}
        </section>
    );
    return (
        <>
            <header className="b-rec-head" aria-hidden="true">
                <div className="b-rec-id">
                    <span className="b-av b-av--lg b-skel-av" />
                    <div className="b-skel-id">
                        <Skel w="12rem" h="1.125rem" />
                        <Skel w="8rem" h=".625rem" />
                    </div>
                </div>
                <div className="b-rec-stats">{[0, 1, 2, 3].map(stat)}</div>
            </header>
            <nav className="b-tabs" aria-hidden="true">
                {tabs.map((t) => (
                    <a key={t} tabIndex={-1}>
                        {t}
                    </a>
                ))}
            </nav>
            <div className="b-rec-cols" aria-hidden="true">
                <div className="b-rec-main">
                    {sec(3, [64, 48, 56], 'a')}
                    {sec(4, [52, 70, 40, 60], 'b')}
                </div>
                <aside className="b-rail">{sec(3, [80, 60, 70], 'c')}</aside>
            </div>
        </>
    );
}

const SKELETONS: Record<QueryGateProps<unknown>['kind'], (o: { action?: ReactNode; tabs?: string[] }) => ReactNode> = {
    list: ListSkeleton,
    rec: RecSkeleton,
};
