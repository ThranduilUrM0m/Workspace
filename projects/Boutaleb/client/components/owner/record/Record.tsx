'use client';

import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { initials } from '@/lib/projects/derive';

// The record vocabulary (component-map C11 Record, C12 TabNav, C13 Avatar,
// C16 Tag, C17 Chip; wireframes/shell/shell.css "Record header", "Tab row").
// Projects fixes the shape; Clients, Deals and Finance inherit it unchanged,
// so the class names and the DOM order are the contract. Which stats a
// header shows is the record type's decision, not this primitive's.

/** C13. Identity is ink, never hue: the palette is spent on the tag families. */
export function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <span className={`b-av b-av--${size}`} aria-hidden="true">
            {initials(name)}
        </span>
    );
}

/** C11. Identity left, up to four stats right. The tab row under it draws the one rule. */
export function RecordHead({
    name,
    meta,
    stats,
    who = name,
}: {
    name: string;
    meta: ReactNode;
    stats: ReactNode;
    /** Whose initials the avatar shows, when the record is not named after a person (a deal shows its client). */
    who?: string;
}) {
    return (
        <header className="b-rec-head">
            <div className="b-rec-id">
                <Avatar name={who} />
                <div>
                    <h2 className="b-rec-name">{name}</h2>
                    <div className="b-rec-meta">{meta}</div>
                </div>
            </div>
            <div className="b-rec-stats">{stats}</div>
        </header>
    );
}

/** The dot between two meta facts. */
export const Sep = () => (
    <span className="sep" aria-hidden="true">
        ·
    </span>
);

/** A header readout. `none` is the word for a fact that does not exist yet. */
export function RecStat({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="stat">
            <span className="stat-lbl">{label}</span>
            <span className="stat-val">{children}</span>
        </div>
    );
}

export const RecNone = ({ children }: { children: ReactNode }) => <span className="b-rec-none">{children}</span>;

export interface Tab<K extends string> {
    key: K;
    label: string;
}

/**
 * C12. Links, not buttons: each tab is an address (?tab=), so it can be
 * shared, reloaded and opened in a new tab. Always visible, never disabled;
 * an empty tab says which state it is in and why.
 */
export function TabNav<K extends string>({ tabs, active, href, label }: { tabs: readonly Tab<K>[]; active: K; href: (k: K) => string; label: string }) {
    return (
        <nav className="b-tabs" aria-label={label}>
            {tabs.map((t) => (
                <Link key={t.key} href={href(t.key)} className={t.key === active ? 'is-active' : undefined} aria-current={t.key === active ? 'page' : undefined} scroll={false}>
                    {t.label}
                </Link>
            ))}
        </nav>
    );
}

/** Main column and rail, at the list's track sizes. */
export function RecordCols({ main, rail }: { main: ReactNode; rail: ReactNode }) {
    return (
        <div className="b-rec-cols">
            <div className="b-rec-main">{main}</div>
            <aside className="b-rail">{rail}</aside>
        </div>
    );
}

/** A section of the record: the shared heading, and a note on what it is for or whose facts it borrows. */
export function RecSection({ title, note, className, i, children }: { title: string; note?: string; className?: string; /** Reading order, for the entrance stagger. */ i?: number; children: ReactNode }) {
    return (
        <section className={className} aria-label={title} style={i === undefined ? undefined : ({ '--i': i } as CSSProperties)}>
            <h2 className="b-sec-h">
                {title}
                {note && <span className="b-rec-secn">{note}</span>}
            </h2>
            {children}
        </section>
    );
}

/** The way out of a borrowed block, to the screen that owns it. */
export function RecMore({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link className="b-rec-more" href={href}>
            {children}
        </Link>
    );
}

/** C16. A word with a tint. The word carries the fact; the tint only agrees. */
export function Tag({ tone, children }: { tone?: string; children: ReactNode }) {
    return <span className={tone ? `tag ${tone}` : 'tag'}>{children}</span>;
}

/**
 * C17. A switch-shaped readout. With `onToggle` it is a real toggle
 * (aria-pressed); without, it only reports a state, so it is not a button
 * that does nothing.
 */
export function Chip({ on, n, onToggle, children }: { on: boolean; n?: number; onToggle?: () => void; children: ReactNode }) {
    const body = (
        <>
            {children}
            {n !== undefined && <span className="n">{n}</span>}
        </>
    );
    if (onToggle)
        return (
            <button type="button" className={on ? 'chip on' : 'chip'} aria-pressed={on} onClick={onToggle}>
                {body}
            </button>
        );
    return <span className={on ? 'chip on' : 'chip'}>{body}</span>;
}
