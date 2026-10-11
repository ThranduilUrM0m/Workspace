'use client';

import { useEffect, useRef, useState } from 'react';

type Item = { id: string; n: string; label: string };

// Contents: always open from 56rem, where it is the sticky column; on the
// phone a closed disclosure that shuts again once a section is picked.
// Settings' spy rule: the current section is the last one whose top has
// passed the upper third; at the bottom of the page, the last one.
export function LegalToc({ items, summary, label }: { items: Item[]; summary: string; label: string }) {
    const ref = useRef<HTMLDetailsElement>(null);
    const [on, setOn] = useState(items[0]?.id);

    useEffect(() => {
        const wide = matchMedia('(min-width:56rem)');
        const fit = () => ref.current && (ref.current.open = wide.matches);
        fit();
        wide.addEventListener('change', fit);

        const spy = () => {
            let current = items[0]?.id;
            if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
                current = items[items.length - 1]?.id;
            } else {
                for (const { id } of items) {
                    const sec = document.getElementById(id);
                    if (sec && sec.getBoundingClientRect().top < innerHeight / 3) current = id;
                }
            }
            setOn(current);
        };
        spy();
        addEventListener('scroll', spy, { passive: true });
        return () => {
            wide.removeEventListener('change', fit);
            removeEventListener('scroll', spy);
        };
    }, [items]);

    const pick = () => {
        if (ref.current && !matchMedia('(min-width:56rem)').matches) ref.current.open = false;
    };

    return (
        <details className="l-toc" ref={ref}>
            <summary>{summary}</summary>
            <nav aria-label={label}>
                {items.map(({ id, n, label: text }) => (
                    <a key={id} href={`#${id}`} className={id === on ? 'l-ix is-on' : 'l-ix'} onClick={pick}>
                        <span className="l-ix-n">{n}</span>
                        <span className="l-ix-t">{text}</span>
                    </a>
                ))}
            </nav>
        </details>
    );
}
