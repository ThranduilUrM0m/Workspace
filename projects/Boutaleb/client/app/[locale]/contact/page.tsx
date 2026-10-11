import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/public/forms/ContactForm';
import type { Locale } from '@/i18n/routing';
import { getErrorWords } from '@/lib/error-words';
import { seoFor } from '@/lib/seo';
import '@/styles/contact.css';

// Ported from Blueprinting/wireframes/public/contact.html (stepper v4).
// Copy English only until translated (error words too: lib/error-words.ts).

const TRANSLATED = ['en'] as const;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return seoFor(
        { title: 'Contact', seo: { description: 'Say what is on your mind; a few follow-up questions shape it into a full project guide.' } },
        locale as Locale,
        { path: '/contact', translated: TRANSLATED },
    );
}

export default async function ContactPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);
    const lang = TRANSLATED.includes(locale as 'en') ? locale : 'en';
    const errorWords = await getErrorWords(lang);

    return (
        <main className="contact-v1" id="main" lang={lang}>
            <div className="wrap">
                <section className="c-hero">
                    <div className="ghost" aria-hidden="true">
                        Project
                    </div>
                    <h1>Let&rsquo;s start your project</h1>
                    <p>Say what&rsquo;s on your mind — a few follow-up questions shape it into a full project guide.</p>
                </section>

                <ContactForm locale={locale} errorWords={errorWords} />

                <section className="next" aria-labelledby="next-h">
                    <h2 id="next-h">What happens next</h2>
                    <ol className="n-list">
                        <li>You send this message</li>
                        <li>You get a short questionnaire, shaped to your project</li>
                        <li>Your answers become the project guide</li>
                        <li>Refined with you, then built</li>
                    </ol>
                </section>
            </div>
        </main>
    );
}
