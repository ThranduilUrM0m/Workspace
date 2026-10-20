import type { Metadata } from 'next';
import { AppPage } from '@/components/owner/shell/AppPage';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'Not built yet' };

type Props = { params: Promise<{ rest: string[] }> };

// Every nav entry whose screen is not built yet lands here, inside the
// shell, so the nav can be walked end to end. Each real screen replaces
// its slice of this route as its ticket lands.
export default async function NotBuiltPage({ params }: Props) {
    await requireOwnerSession();
    const { rest } = await params;
    const name = rest.map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')).join(' › ');
    return (
        <AppPage title={name} kicker="Not built yet">
            <p>This screen comes with a later build ticket.</p>
        </AppPage>
    );
}
