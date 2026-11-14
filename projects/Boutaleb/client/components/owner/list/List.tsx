'use client';

import Link from 'next/link';
import { createContext, Fragment, useContext, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

// C9 List, C10 Stat, C18 Kind mark, C21 list entrance: the skeleton every
// ERP list shares (wireframes/shell/shell.css "The list vocabulary"). Each
// screen fills the cells; the shape, the breakpoints and the motion are
// here. Styles: styles/list.css.
//
// Phone first: a row is two lines (identity and its action, then clock,
// work, money). 60rem: one line, tracks from --row-cols. 80rem: the rail
// sits beside the list instead of under it.

/* ---------- C21: the entrance ---------- */

const Entering = createContext(false);

/**
 * First render only: rows rise per group, group rules draw, the rail
 * follows, strip figures count up, alert chips beat once. Mount it around
 * the ready list; it drops the class after 2s, so filtering or folding
 * never replays it (those re-render inside, they do not remount this).
 */
export function ListEnter({ children }: { children: ReactNode }) {
    const [on, setOn] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setOn(false), 2000);
        return () => clearTimeout(t);
    }, []);
    return (
        <Entering.Provider value={on}>
            <div className={on ? 'b-list-enter' : undefined} style={{ display: 'contents' }}>
                {children}
            </div>
        </Entering.Provider>
    );
}

/** Counts the digits of "148 000 MAD" up from zero over 900ms on entrance; spacing and unit stay put. */
function Count({ text }: { text: string }) {
    const entering = useContext(Entering);
    const m = text.match(/\d[\d\s  ]*\d|\d/);
    const [shown, setShown] = useState(entering && m ? text.replace(m[0], '0') : text);
    useEffect(() => {
        if (!entering || !m || matchMedia('(prefers-reduced-motion: reduce)').matches) return setShown(text);
        const end = Number(m[0].replace(/\D/g, ''));
        const sep = m[0].match(/[\s  ]/)?.[0] ?? ' ';
        const fmt = (v: number) => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
        const t0 = performance.now();
        let raf = 0;
        const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / 900);
            setShown(text.replace(m[0], fmt(Math.round(end * (1 - (1 - k) ** 3)))));
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- once per value, on entrance only
    }, [text]);
    return <>{shown}</>;
}

/* ---------- C10 Stat and the strip ---------- */

export interface StatProps {
    label: string;
    value: string;
    /** The qualifier carrying the unit: "2 projects", "in 4 days". */
    sub?: string;
    subTone?: 'late' | 'soon';
    /** A stat that is a way in: ink with a faint underline. */
    href?: string;
}

export function Stat({ label, value, sub, subTone, href }: StatProps) {
    const v = <Count text={value} />;
    return (
        <div className="stat">
            <span className="stat-lbl">{label}</span>
            <span className="stat-val">{href ? <Link href={href}>{v}</Link> : v}</span>
            {sub && <span className={`b-list-sub${subTone ? ` is-${subTone}` : ''}`}>{sub}</span>}
        </div>
    );
}

/** The position strip: the facts between the rows, then the one primary action (full width on a phone). */
export function ListStrip({ stats, action }: { stats: ReactNode[]; action?: ReactNode }) {
    return (
        <div className="b-list-strip">
            {stats.map((s, i) => (
                <Fragment key={i}>
                    {i > 0 && <span className="divider" aria-hidden="true" />}
                    {s}
                </Fragment>
            ))}
            {action}
        </div>
    );
}

/* ---------- body, groups, rows ---------- */

export function ListCols({ children, rail }: { children: ReactNode; rail?: ReactNode }) {
    return (
        <div className="b-list-cols">
            <div className="b-list-main">{children}</div>
            {rail}
        </div>
    );
}

export type GroupTone = 'mine' | 'theirs' | 'parked' | 'done' | 'none' | 'ok';

/**
 * A group heading with its count and a short toned rule. An empty group
 * still renders its heading: "nothing is waiting on a client" is an
 * answer. Pass `fold` and the heading becomes the toggle (Completed).
 */
export function ListGroup({
    tone,
    label,
    count,
    fold,
    children,
}: {
    tone: GroupTone;
    label: string;
    count: number;
    fold?: { open: boolean; onToggle: () => void };
    children?: ReactNode;
}) {
    const n = <span className="b-list-gh-n">{count}</span>;
    return (
        <section className="b-list-group" aria-label={label}>
            {fold ? (
                <h2 className="b-list-gh-wrap">
                    <button type="button" className={`b-list-gh b-list-gh--${tone} b-list-gh--btn`} aria-expanded={fold.open} onClick={fold.onToggle}>
                        {label}
                        {n}
                        <svg className="b-list-gh-c" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                            <path d="M7 5l5 5-5 5" />
                        </svg>
                    </button>
                </h2>
            ) : (
                <h2 className={`b-list-gh b-list-gh--${tone}`}>
                    {label}
                    {n}
                </h2>
            )}
            {(!fold || fold.open) && children}
        </section>
    );
}

/**
 * Five cells: identity · clock · work · money · action. The name's
 * stretched ::after makes the whole row the way into the record; anything
 * else clickable in the row (client link, action) sits above it. One
 * anchor per destination, never nested.
 */
export function ListRow({
    name,
    href,
    meta,
    clock,
    work,
    money,
    act,
    avatar,
    n = 0,
}: {
    name: string;
    href: string;
    /** A person's row carries their initials (Clients); a project's does not. */
    avatar?: string;
    meta?: ReactNode;
    clock?: ReactNode;
    work?: ReactNode;
    money?: ReactNode;
    act?: ReactNode;
    /** Place in the group, for the entrance stagger. */
    n?: number;
}) {
    return (
        <div className="b-list-row" style={{ '--n': n } as CSSProperties}>
            <div className="b-list-id">
                {avatar ? (
                    <>
                        <span className="b-av b-av--md" aria-hidden="true">
                            {avatar}
                        </span>
                        <span className="cl-idt">
                            <Link className="b-list-name" href={href}>
                                {name}
                            </Link>
                            {meta && <span className="b-list-meta">{meta}</span>}
                        </span>
                    </>
                ) : (
                    <>
                        <Link className="b-list-name" href={href}>
                            {name}
                        </Link>
                        {meta && <span className="b-list-meta">{meta}</span>}
                    </>
                )}
            </div>
            <div className="b-list-clock">{clock}</div>
            <div className="b-list-work">{work}</div>
            <div className="b-list-money">{money}</div>
            <div className="b-list-actc">{act}</div>
        </div>
    );
}

/** The row's one verb. `chase` is the filled one: the rot is the loudest thing on the screen. */
export function RowAction({ href, label, chase }: { href: string; label: string; chase?: boolean }) {
    return (
        <Link className={`b-list-act${chase ? ' is-chase' : ''}`} href={href}>
            {label}
        </Link>
    );
}

/** "There is nothing here yet", with the way out. */
export function ListEmpty({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
    return (
        <div className="b-list-empty">
            <h2>{title}</h2>
            <p>{children}</p>
            {action}
        </div>
    );
}

/** "Your filter matched nothing", saying what was searched. */
export function ListNoMatch({ q }: { q: string }) {
    return (
        <p className="b-list-nomatch" role="status">
            Nothing matches “{q}”.
        </p>
    );
}

/* ---------- the rail and its feeds ---------- */

export function Rail({ children }: { children: ReactNode }) {
    return <aside className="b-rail">{children}</aside>;
}

export function RailSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section aria-label={title}>
            <h2 className="b-sec-h">{title}</h2>
            {children}
        </section>
    );
}

/** A feed with nothing in it says so in a sentence. */
export function FeedNone({ children }: { children: ReactNode }) {
    return <p className="b-feed-none">{children}</p>;
}

export function Feed({ children }: { children: ReactNode }) {
    return <div className="b-feed">{children}</div>;
}

/** The dated feed: "Mon 9 Nov" beside what is due. */
export function FeedEvent({ date, tone, title, sub, n = 0 }: { date: string; tone?: 'late' | 'soon'; title: string; sub?: string; n?: number }) {
    return (
        <div className="b-ev" style={{ '--n': n } as CSSProperties}>
            <span className={`b-ev-d${tone ? ` is-${tone}` : ''}`}>{date}</span>
            <span className="b-ev-t">
                {title}
                {sub && <span className="b-ev-p">{sub}</span>}
            </span>
        </div>
    );
}

/* ---------- C18 Kind mark ---------- */

export type Kind = 'call' | 'reply' | 'token' | 'mail' | 'sent' | 'note';

/** Who acted, as a word in a colour: a reply or a call is the client; a token or mail is you. */
export function KindMark({ kind }: { kind: Kind }) {
    return <span className={`b-kind b-kind--${kind}`}>{kind}</span>;
}

/** The activity feed: age in days, the kind, what happened. */
export function FeedActivity({ age, kind, text, sub, n = 0 }: { age: number; kind: Kind; text: string; sub?: string; n?: number }) {
    return (
        <div className="b-ac" style={{ '--n': n } as CSSProperties}>
            <span className="b-ac-age">{age}d</span>
            <span className="b-ac-t">
                <KindMark kind={kind} />
                {text}
                {sub && <span className="b-ac-p">{sub}</span>}
            </span>
        </div>
    );
}
