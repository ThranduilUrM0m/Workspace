import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { privacyEn } from '@/content/legal/privacy.en';
import type { Locale } from '@/i18n/routing';
import { seoFor } from '@/lib/seo';

// Only the English copy exists so far; every language renders it, marked
// lang="en", until the French translation lands (plan R3). Until then /privacy
// and /ar/privacy stay out of the index and out of hreflang (seo-boutaleb §2).
const TRANSLATED = ['en'] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return seoFor({ title: privacyEn.title, seo: { description: privacyEn.description } }, locale as Locale, {
        path: '/privacy',
        translated: TRANSLATED,
    });
}

export default async function PrivacyPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <LegalLayout doc={privacyEn} />;
}
