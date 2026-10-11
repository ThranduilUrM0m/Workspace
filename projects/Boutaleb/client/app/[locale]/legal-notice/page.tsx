import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalLayout, type LegalDoc } from '@/components/legal/LegalLayout';
import { noticeEntries, noticeStatus, noticeUpdated, PENDING } from '@/content/legal/legal-notice.fr';
import type { Locale } from '@/i18n/routing';
import { business } from '@/lib/business';
import { seoFor } from '@/lib/seo';

// The record is French in every language (legal.html, Legal notice); the head
// speaks the URL's language and says so. Only /legal-notice is indexed.
const TRANSLATED = ['fr'] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const n = await getTranslations({ locale, namespace: 'nav' });
    return seoFor(
        { title: n('legalNotice'), seo: { description: `${noticeStatus} Contact : ${business.email}.` } },
        locale as Locale,
        { path: '/legal-notice', translated: TRANSLATED },
    );
}

export default async function LegalNoticePage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('legal');
    const n = await getTranslations('nav');
    const entries = noticeEntries(business.brand, business.email);
    const published = entries.filter((e) => e.value).length;

    const doc: LegalDoc = {
        page: 'legal-notice',
        lang: locale,
        order: '003',
        ghost: t('eyebrow'),
        title: n('legalNotice'),
        description: noticeStatus,
        updated: noticeUpdated,
        bodyLang: locale === 'fr' ? undefined : 'fr',
        note: locale === 'fr' ? undefined : t('frenchOnly'),
    };

    const meter = (
        <aside className="l-meter" aria-label={t('registration')}>
            <p className="m-n">
                {published}
                <span>/ {entries.length}</span>
            </p>
            <p className="m-t">{t('published')}</p>
            <ol className="m-bar" aria-hidden="true">
                {entries.map((e, i) => (
                    <li key={e.label} className={i < published ? 'on' : undefined} />
                ))}
            </ol>
        </aside>
    );

    return (
        <LegalLayout doc={doc} aside={meter}>
            <p className="l-status">{noticeStatus}</p>
            <dl className="l-rec">
                {entries.map((e) => (
                    <div key={e.label} className="inset">
                        <dt>{e.label}</dt>
                        {e.value ? (
                            <dd>{e.href ? <a href={e.href}>{e.value}</a> : e.value}</dd>
                        ) : (
                            <dd className="pending">{e.pendingLabel ?? PENDING}</dd>
                        )}
                    </div>
                ))}
            </dl>
        </LegalLayout>
    );
}
