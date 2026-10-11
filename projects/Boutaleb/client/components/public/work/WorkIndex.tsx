'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';

// The /portfolio index: filters + grid (portfolio.html). No empty state by
// construction: a filter is drawn only for a category that has projects, and
// carries its count, so no button can lead to an empty grid.

export type IndexCard = { slug: string; title: string; category: string; categoryLabel: string; year: number; blurb: string };

export function WorkIndex({ cards, allLabel, filterLabel, cta }: { cards: IndexCard[]; allLabel: string; filterLabel: string; cta: string }) {
    const [filter, setFilter] = useState('all');
    const categories = [...new Map(cards.map((c) => [c.category, c.categoryLabel])).entries()];
    const count = (cat: string) => cards.filter((c) => c.category === cat).length;

    return (
        <>
            <div className="filters" role="group" aria-label={filterLabel}>
                <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                    {allLabel}
                    <sup>{cards.length}</sup>
                </button>
                {categories.map(([cat, label]) => (
                    <button key={cat} type="button" aria-pressed={filter === cat} onClick={() => setFilter(cat)}>
                        {label}
                        <sup>{count(cat)}</sup>
                    </button>
                ))}
            </div>

            <div className="grid-wrap">
                <div className="sidebar-big font-display" aria-hidden="true">
                    <span>PORTFOLIO</span>
                </div>
                <div className="g3">
                    {cards.map((c, i) => {
                        const n = String(i + 1).padStart(2, '0');
                        return (
                            <Link
                                key={c.slug}
                                className="card"
                                href={`/portfolio/${c.slug}`}
                                scroll={false}
                                hidden={filter !== 'all' && c.category !== filter}
                            >
                                <div className="ph" data-id={n}>
                                    <div className="hover-overlay" aria-hidden="true">
                                        <span className="cat">
                                            {c.categoryLabel} — {c.year}
                                        </span>
                                        <div className="t">{c.title}</div>
                                        <div className="ln" />
                                        <p className="d">{c.blurb}</p>
                                        <span className="cs">
                                            {cta} <span className="arr">&rarr;</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="gcap">
                                    <span>
                                        <span className="idx">{n}</span>
                                        <b>{c.title}</b>
                                    </span>
                                    <span className="meta">{c.categoryLabel}</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
