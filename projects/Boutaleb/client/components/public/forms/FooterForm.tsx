'use client';

import { footerEnquiry, PROJECT_TYPES } from '@repo/schemas';
import { Field, Form, Honeypot, SelectField, useSchemaForm } from '@repo/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useErrorWords } from './error-words';
import { glyph } from './glyphs';

// The footer's short form (thanks.html), on the shared fields (C3/C4) and
// the enquiry schema the server will run too. Its action still leads to
// /contact; ticket T5.3 makes it send in place.

const TYPE_KEY = { website: 'typeWebsite', erp: 'typeErp', both: 'typeBoth', 'not-sure': 'typeUnsure' } as const;

export function FooterForm() {
    const t = useTranslations('footer');
    const errorWords = useErrorWords();
    const [idempotencyKey] = useState(() => crypto.randomUUID());
    const form = useSchemaForm(footerEnquiry, { name: '', email: '', projectType: 'website', message: '', idempotencyKey });

    return (
        <Form className="ff-form" form={form} errorWords={errorWords} onSubmit={() => {}}>
            <div className="ff-pair">
                <Field name="name" label={t('fullName')} icon={glyph.person} autoComplete="name" />
                <Field name="email" type="email" label={t('email')} icon={glyph.mail} autoComplete="email" />
            </div>
            <SelectField
                name="projectType"
                label={t('projectType')}
                icon={glyph.tag}
                options={PROJECT_TYPES.map((v) => ({ value: v, label: t(TYPE_KEY[v]) }))}
            />
            <Field name="message" label={t('message')} icon={glyph.bubble} multiline />
            <Honeypot />
            <div className="ff-send">
                <p>
                    {t('usedOnlyToReply')} <Link href="/privacy">{t('privacyPolicy')}</Link>.
                </p>
                <Link className="ff-go" href="/contact">
                    {t('start')}
                    <svg className="flip-rtl" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B1B1F" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                </Link>
            </div>
        </Form>
    );
}
