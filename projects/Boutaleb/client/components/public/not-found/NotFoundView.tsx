'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getPathname, Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { business } from '@/lib/business';
import { closestRoute } from '@/lib/closest-route';
import { track } from '@/lib/analytics';
import '@/styles/not-found.css';

// Ported from Blueprinting/wireframes/public/404.html (locked 2026-09-27).
// Client side because not-found.tsx gets no params: the asked-for path comes
// from the URL. React escapes it everywhere it is echoed.

const WAYS = ['services', 'portfolio', 'blog', 'contact'] as const;

// Past the room's width the path ellipsises; the full one is in the head.
const cut = (p: string) => (p.length > 18 ? `${p.slice(0, 17)}…` : p);

function withoutLocale(path: string) {
    const [, first, ...rest] = path.split('/');
    return routing.locales.some((l) => l === first) ? `/${rest.join('/')}` : path;
}

// A malformed escape (a cut-off "%E2%80") would make decodeURI throw.
function readable(path: string) {
    try {
        return decodeURI(path);
    } catch {
        return path;
    }
}

export function NotFoundView() {
    const t = useTranslations('notFound');
    const n = useTranslations('nav');
    const locale = useLocale() as Locale;
    const asked = readable(usePathname());
    const match = closestRoute(withoutLocale(asked));
    const [typed, setTyped] = useState(cut(asked));

    useEffect(() => {
        track('404', { path: asked });
    }, [asked]);

    // The path types into the missing room once the room has appeared.
    useEffect(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const full = cut(asked);
        let i = 0;
        let timer: ReturnType<typeof setTimeout>;
        setTyped('');
        const type = () => {
            setTyped(full.slice(0, ++i));
            if (i < full.length) timer = setTimeout(type, 40);
        };
        timer = setTimeout(type, 2300);
        return () => clearTimeout(timer);
    }, [asked]);

    const matchLabel =
        match && match.href.includes('#') ? `${n('services')} — ${n(match.key)}` : match ? n(match.key) : null;

    return (
        <main className="nf-v1" id="main">
            <title>{`${t('title')} — ${business.brand}`}</title>
            <div className="wrap">
                <div className="nf-hero">
                    <div className="nf-head">
                        <div className="eyebrow">{t('eyebrow')}</div>
                        <h1>{t('heading')}</h1>
                        <p className="nf-lede">{t('lede')}</p>
                        <p className="nf-path">
                            {t('askedFor')} <code dir="ltr">{asked}</code>
                        </p>
                    </div>
                    <div className="nf-plan" aria-hidden="true">
                        <svg viewBox="0 0 404.94 384">
                            <defs>
                                <pattern id="nf-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                    <line x1="0" y1="0" x2="0" y2="5" stroke="#C4694A" strokeWidth="1.2" strokeOpacity=".55" />
                                </pattern>
                            </defs>
                            <rect className="nf-room" data-room="services" x="55.88" y="55.85" width="41.96" height="97.77" />
                            <rect className="nf-room" data-room="portfolio" x="118.78" y="55.85" width="104.65" height="38.29" />
                            <rect className="nf-room" data-room="blog" x="118.78" y="289.66" width="104.65" height="38.5" />
                            <rect className="nf-room" data-room="contact" x="244.37" y="101.23" width="104.69" height="52.39" />
                            <rect className="nf-miss-fill" x="244.37" y="230.42" width="104.69" height="59.24" fill="url(#nf-hatch)" />
                            <rect className="nf-miss-line" x="247.37" y="233.42" width="98.69" height="53.24" />
                            <path
                                className="nf-walls"
                                pathLength={1}
                                d="m370.04,209.44V34.98h-62.83V0h-20.94v34.98H118.78V0h-20.94v34.98h-62.9v118.65H0v20.98h34.94v34.84H0v20.98h34.94v118.72h62.9v34.87h20.94v-34.87h167.48v34.87h20.94v-34.87h62.83v-118.72h34.91v-20.98s-34.91,0-34.91,0Zm-272.2,118.72h-41.96v-97.74h41.96v97.74Zm0-118.72h-41.96v-34.84h41.96v34.84Zm0-55.81h-41.96V55.85h41.96v97.77Zm20.94-97.77h104.65v38.29h-104.65s0-38.29,0-38.29Zm104.65,272.3h-104.65v-38.5h104.65v38.5Zm125.63-118.72h-76.72v20.98h76.72v97.74h-41.85v-38.5h-20.94v38.5h-41.82v-118.72h-52.39v20.98h31.38v38.36h-104.65v-38.36h45.31v-20.98h-45.31v-34.84h80.21v-20.98h-80.21v-38.43h104.65v59.41h80.28v-20.98h-59.27V55.85h41.82v45.38h20.94v-45.38h41.85s0,153.59,0,153.59Z"
                            />
                        </svg>
                        <span className="nf-lbl" data-room="services">
                            <span className="v">{n('services')}</span>
                        </span>
                        <span className="nf-lbl" data-room="portfolio">{n('portfolio')}</span>
                        <span className="nf-lbl" data-room="blog">{n('blog')}</span>
                        <span className="nf-lbl" data-room="contact">{n('contact')}</span>
                        <span className="nf-miss">
                            <bdi dir="ltr">{typed}</bdi>
                        </span>
                    </div>
                </div>

                <div className="nf-body">
                    {match && matchLabel && (
                        <p className="nf-mean">
                            <span className="k">{t('didYouMean')}</span>
                            <Link href={match.href}>{matchLabel}</Link>
                            <span className="u" dir="ltr">
                                {getPathname({ href: match.href, locale })}
                            </span>
                        </p>
                    )}

                    <nav className="nf-ways" aria-label={t('waysOn')}>
                        {WAYS.map((key) => (
                            <Link key={key} href={`/${key}`} className="inset" data-room={key}>
                                <b>{n(key)}</b>
                                <span>{t(`${key}Blurb`)}</span>
                                <i aria-hidden="true">→</i>
                            </Link>
                        ))}
                    </nav>

                    <p className="nf-report">
                        {t('reportBefore')}
                        <a href={`mailto:${business.email}?subject=${encodeURIComponent(t('reportSubject', { path: asked }))}`}>
                            {t('reportLink')}
                        </a>
                        {t('reportAfter')}
                    </p>
                </div>
            </div>
        </main>
    );
}
