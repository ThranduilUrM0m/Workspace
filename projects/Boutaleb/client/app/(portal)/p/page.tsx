import { headers } from 'next/headers';
import { PortalResend } from '@/components/portal/PortalResend';
import { pickLang } from '@/lib/portal/resend-copy';

// /p with no token: "email me my access link" (T8.5). Reached from the page a
// dead link lands on. Same shell, headers and noindex as /p/<token>. The
// language is the browser's first match among FR / AR / EN (nothing is known
// about the visitor, and no record is looked up), French otherwise.
export const dynamic = 'force-dynamic';

export default async function PortalResendPage() {
    return <PortalResend initialLang={pickLang((await headers()).get('accept-language'))} />;
}
