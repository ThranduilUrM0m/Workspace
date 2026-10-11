'use client';

import { FIELD_ERRORS } from '@repo/schemas';
import type { ErrorWords } from '@repo/ui';
import { useTranslations } from 'next-intl';

/** The schema's error codes in the page's language (messages formErrors). */
export function useErrorWords(): ErrorWords {
    const t = useTranslations('formErrors');
    return Object.fromEntries(FIELD_ERRORS.map((code) => [code, t(code)]));
}
