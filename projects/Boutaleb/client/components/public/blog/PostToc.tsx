'use client';

import { useRef } from 'react';
import { useSectionSpy } from '@/lib/use-section-spy';

// A post's contents, twice (blog-post.html): on the phone a closed
// disclosure between the stats and the article, shut again once a section
// is picked; from 56rem the side column's list. CSS shows one or the other.
// The marker follows the section being read in both.

type Item = { id: string; title: string };

export function PhoneToc({ items, summary, label }: { items: Item[]; summary: string; label: string }) {
    const ref = useRef<HTMLDetailsElement>(null);
    const on = useSectionSpy(items.map((i) => i.id));
    return (
        <details className="ptoc" ref={ref}>
            <summary>{summary}</summary>
            <nav aria-label={label}>
                <Links items={items} on={on} onPick={() => ref.current && (ref.current.open = false)} />
            </nav>
        </details>
    );
}

export function SideToc({ items, label }: { items: Item[]; label: string }) {
    const on = useSectionSpy(items.map((i) => i.id));
    return (
        <nav className="side-block toc" aria-labelledby="toc-cap">
            <p className="side-cap" id="toc-cap">
                {label}
            </p>
            <Links items={items} on={on} />
        </nav>
    );
}

function Links({ items, on, onPick }: { items: Item[]; on?: string; onPick?: () => void }) {
    return (
        <ol>
            {items.map(({ id, title }) => (
                <li key={id}>
                    <a href={`#${id}`} aria-current={id === on ? 'true' : undefined} onClick={onPick}>
                        {title}
                    </a>
                </li>
            ))}
        </ol>
    );
}
