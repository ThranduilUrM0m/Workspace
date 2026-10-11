'use client';

import { useEffect, useRef } from 'react';
import { useSectionSpy } from '@/lib/use-section-spy';

type Item = { id: string; n: string; label: string };

// Contents: always open from 56rem, where it is the sticky column; on the
// phone a closed disclosure that shuts again once a section is picked.
// The current section follows the reader (lib/use-section-spy.ts).
export function LegalToc({ items, summary, label }: { items: Item[]; summary: string; label: string }) {
    const ref = useRef<HTMLDetailsElement>(null);
    const on = useSectionSpy(items.map((i) => i.id));

    useEffect(() => {
        const wide = matchMedia('(min-width:56rem)');
        const fit = () => ref.current && (ref.current.open = wide.matches);
        fit();
        wide.addEventListener('change', fit);

        return () => wide.removeEventListener('change', fit);
    }, []);

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
