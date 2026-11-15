import { notFound } from 'next/navigation';
import { PortalIntake } from '@/components/portal/PortalIntake';
import { portalView } from '@/lib/portal/api';

// /p/<token>: the client's questionnaire. Read on the server, so the answers
// already given are in the first paint and the token never needs a second
// trip. An unknown, replaced or closed link is the same 404 (not-found.tsx).
export const dynamic = 'force-dynamic';

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const view = await portalView(token);
    if (!view) notFound();
    return <PortalIntake token={token} initial={view} />;
}
