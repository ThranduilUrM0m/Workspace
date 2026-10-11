import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { termsEn } from '@/content/legal/terms.en';
import type { Locale } from '@/i18n/routing';
import { seoFor } from '@/lib/seo';

// English copy only so far, like /privacy: every language renders it marked
// lang="en", and only /en/terms is indexed until the translations land.
const TRANSLATED = ['en'] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return seoFor({ title: termsEn.title, seo: { description: termsEn.description } }, locale as Locale, {
        path: '/terms',
        translated: TRANSLATED,
    });
}

export default async function TermsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <LegalLayout doc={termsEn} />;
}
