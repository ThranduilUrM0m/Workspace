import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontVariables } from '../fonts';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { SITE_URL } from '@/lib/seo';
import '../globals.css';

// Every public page's own metadata comes from seoFor() (lib/seo.ts).
export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { template: '%s — Boutaleb', default: 'Boutaleb' },
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) notFound();
    setRequestLocale(locale);

    return (
        <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={fontVariables}>
            <body>
                <NextIntlClientProvider>
                    <SiteHeader />
                    {children}
                    <SiteFooter />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
