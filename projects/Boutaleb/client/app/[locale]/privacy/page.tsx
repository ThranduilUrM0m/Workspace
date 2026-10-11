import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalLayout } from '@/components/legal/LegalLayout';
import { privacyEn } from '@/content/legal/privacy.en';

// Only the English copy exists so far; every language renders it, marked
// lang="en", until the French translation lands (plan R3). Full metadata
// chain (canonical, hreflang, OG): ticket T2.6.
export const metadata: Metadata = {
    title: `${privacyEn.title} — Boutaleb`,
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    return <LegalLayout doc={privacyEn} />;
}
