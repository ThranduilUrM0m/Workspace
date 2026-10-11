import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { SITE_PLAN_VIEWBOX, SITE_PLAN_WALLS } from '@/components/public/site-plan';
import { business } from '@/lib/business';
import type { Locale } from '@/i18n/routing';
import { seoFor } from '@/lib/seo';
import { readableEmail, THANKS_COOKIE } from '@/lib/thanks';
import '@/styles/thanks.css';

// Ported from Blueprinting/wireframes/public/thanks.html (locked 2026-09-27).
// Where the /contact intake lands (303). noindex, never in the sitemap;
// conversions are counted server-side by the form handler, not here.

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'thanks' });
    return seoFor({ title: t('title'), seo: { description: t('description') } }, locale as Locale, {
        path: '/thanks',
        noindex: true,
    });
}

export default async function ThanksPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('thanks');
    const n = await getTranslations('nav');
    const email = readableEmail((await cookies()).get(THANKS_COOKIE)?.value);

    const b = (chunks: React.ReactNode) => <b dir="ltr">{chunks}</b>;
    const steps = [
        { when: t('step1When'), text: t('step1'), state: 'done' },
        { when: t('step2When'), text: email ? t.rich('step2Email', { email, b }) : t('step2'), state: 'now' },
        { when: t('step3When'), text: t('step3') },
        { when: t('step4When'), text: t('step4') },
    ];

    return (
        <main className="ty-v1" id="main">
            <div className="wrap">
                <div className="ty-hero">
                    <div className="ty-head">
                        <div className="eyebrow">{t('eyebrow')}</div>
                        <h1>
                            {t('heading')}
                            <span className="dot">.</span>
                        </h1>
                        {email && (
                            <p className="ty-lede">
                                {t.rich('copyOnItsWay', {
                                    email,
                                    address: business.email,
                                    b,
                                    a: (chunks) => <a href={`mailto:${business.email}`}>{chunks}</a>,
                                })}
                            </p>
                        )}
                    </div>
                    <div className="ty-plan" aria-hidden="true">
                        <svg viewBox={SITE_PLAN_VIEWBOX}>
                            <rect className="ty-new-room" x="244.37" y="230.42" width="104.69" height="59.24" />
                            <rect className="ty-new-dash" x="247.37" y="233.42" width="98.69" height="53.24" />
                            <rect className="ty-new-wall" x="244.37" y="230.42" width="104.69" height="59.24" pathLength={1} />
                            <path className="ty-walls" pathLength={1} d={SITE_PLAN_WALLS} />
                        </svg>
                        <span className="ty-new-lbl">{t('room')}</span>
                    </div>
                </div>

                <div className="ty-body">
                    <h2 className="ty-next-h">{t('next')}</h2>
                    <ol className="ty-steps">
                        {steps.map((step, i) => (
                            <li key={i} className={['inset', step.state].filter(Boolean).join(' ')}>
                                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                                <span className="when">{step.when}</span>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="ty-out">
                        <span>{t('meantime')}</span>
                        <Link href="/portfolio">{n('portfolio')}</Link>
                        <Link href="/blog">{n('blog')}</Link>
                        <Link href="/">{t('home')}</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
