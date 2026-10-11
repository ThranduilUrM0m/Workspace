import { FIELD_ERRORS } from '@repo/schemas';
import type { ErrorWords } from '@repo/ui';
import { getTranslations } from 'next-intl/server';

/** The schema's error codes in the language a page's copy is written in,
 *  which differs from the URL's until a page is translated: an English
 *  page at /fr must not show French badges. */
export async function getErrorWords(lang: string): Promise<ErrorWords> {
    const t = await getTranslations({ locale: lang, namespace: 'formErrors' });
    return Object.fromEntries(FIELD_ERRORS.map((code) => [code, t(code)]));
}
