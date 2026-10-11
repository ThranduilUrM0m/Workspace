// The language list on its own, free of next-intl, so next.config.ts and
// plain unit tests can read it without loading the i18n runtime.
export const locales = ['fr', 'en', 'ar'] as const;
export const defaultLocale = 'fr';
