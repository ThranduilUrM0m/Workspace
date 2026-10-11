'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPathname, Link, usePathname } from '@/i18n/navigation';
import { LOCALE_COOKIE, routing, type Locale } from '@/i18n/routing';
import { business } from '@/lib/business';
import { TangierClock } from './TangierClock';

// Markup and behaviour ported from the locked public header
// (Blueprinting/wireframes/public/legal.html + public.js). DOM order:
// wordmark, nav, language switch, menu button. On a phone the nav is the
// menu panel; from 48rem it is inline and the button is hidden (public.css).

const MAIN = ['services', 'portfolio', 'about', 'blog', 'contact'] as const;
const MORE = [
    { key: 'process', href: '/services#process' },
    { key: 'faq', href: '/services#questions' },
    { key: 'privacy', href: '/privacy' },
    { key: 'terms', href: '/terms' },
    { key: 'legalNotice', href: '/legal-notice' },
] as const;

const LANG_LABEL: Record<Locale, { short: string; aria: string }> = {
    fr: { short: 'FR', aria: 'FR, Français' },
    en: { short: 'EN', aria: 'EN, English' },
    ar: { short: 'عربي', aria: 'عربي، العربية' },
};

// A chosen language is remembered so "/" does not send a returning English
// reader back to French (proxy.ts). Set only by this switch, never by a
// visit: a shared /en link must not change where "/" lands.
function rememberLocale(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

export function SiteHeader() {
    const t = useTranslations('nav');
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const btn = useRef<HTMLButtonElement>(null);
    const nav = useRef<HTMLElement>(null);

    // Open = html.nav-open (CSS draws it); the page behind goes inert, Esc
    // closes and focus returns to the button, crossing 48rem closes it.
    useEffect(() => {
        const html = document.documentElement;
        html.classList.toggle('nav-open', open);
        const rest = document.querySelectorAll<HTMLElement>('body > :not(.site-bar):not(script)');
        rest.forEach((el) => (el.inert = open));
        if (open) nav.current?.querySelector('a')?.focus({ preventScroll: true });

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                setOpen(false);
                btn.current?.focus();
            }
        };
        const wide = matchMedia('(min-width:48rem)');
        const onWide = (e: MediaQueryListEvent) => e.matches && setOpen(false);
        document.addEventListener('keydown', onKey);
        wide.addEventListener('change', onWide);
        return () => {
            document.removeEventListener('keydown', onKey);
            wide.removeEventListener('change', onWide);
        };
    }, [open]);

    const close = () => setOpen(false);
    const current = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header className="site-bar" id="top">
            {/* The wordmark stays Latin. dir="ltr" goes on a <bdi> inside the
                link, never on .site-mark, or its margin-inline-end:auto flips
                and the wordmark glues to the nav (public README item 60). */}
            <Link className="site-mark" href="/">
                <bdi dir="ltr" lang="en" translate="no">
                    {business.brand}
                    <span className="dot">.</span>
                </bdi>
            </Link>
            <nav className="site-nav" id="site-nav" aria-label={t('label')} ref={nav}>
                <ul>
                    {MAIN.map((key, i) => (
                        <li key={key}>
                            <Link
                                href={`/${key}`}
                                style={{ '--i': i } as React.CSSProperties}
                                aria-current={current(`/${key}`) ? 'page' : undefined}
                                onClick={close}
                            >
                                {t(key)}
                            </Link>
                        </li>
                    ))}
                </ul>
                <ul className="nav-more">
                    {MORE.map(({ key, href }) => (
                        <li key={key}>
                            <Link href={href} onClick={close}>
                                {t(key)}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="nav-foot">
                    <div>
                        <span className="nf-cap">{t('writeIn')}</span>
                        <a href={`mailto:${business.email}`}>
                            {business.email} <span className="flip-rtl" aria-hidden="true">↗</span>
                        </a>
                    </div>
                    <div className="nf-end">
                        <span className="nf-cap">{t('tangier')}</span>
                        <TangierClock timeZone={business.timeZone} />
                    </div>
                </div>
            </nav>
            <span className="lang-sw">
                {routing.locales.map((l) =>
                    l === locale ? (
                        <span key={l} aria-current="true" lang={l} aria-label={LANG_LABEL[l].aria}>
                            {LANG_LABEL[l].short}
                        </span>
                    ) : (
                        // A plain link to the real address: next-intl's Link
                        // writes /fr/... for the default language, which only
                        // redirects. A language change reloads the page anyway.
                        <a
                            key={l}
                            href={getPathname({ href: pathname, locale: l })}
                            hrefLang={l}
                            lang={l}
                            aria-label={LANG_LABEL[l].aria}
                            onClick={() => rememberLocale(l)}
                        >
                            {LANG_LABEL[l].short}
                        </a>
                    ),
                )}
            </span>
            <button
                ref={btn}
                className="menu-btn"
                type="button"
                aria-controls="site-nav"
                aria-expanded={open}
                aria-label={open ? t('closeMenu') : t('openMenu')}
                onClick={() => setOpen((o) => !o)}
            >
                <span />
                <span />
            </button>
        </header>
    );
}
