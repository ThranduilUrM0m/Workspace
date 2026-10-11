import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Everything except the API, Next internals, files (anything with a dot),
    // and the owner side: the ERP (/app) and the auth screens are English
    // only and never localised.
    matcher: '/((?!api|_next|app|login|forgot-password|reset-password|.*\\..*).*)',
};
