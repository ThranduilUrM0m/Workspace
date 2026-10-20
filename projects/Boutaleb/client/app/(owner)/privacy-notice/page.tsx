import type { Metadata } from 'next';
import { AuthFrame } from '@/components/owner/auth/AuthFrame';
import { BackToLogin } from '@/components/owner/auth/parts';
import { business } from '@/lib/business';

export const metadata: Metadata = { title: 'How your data is handled' };

// PLACEHOLDER. The notice for people with a workspace account, reachable
// signed out. The full text is drafted (Blueprinting/legal/
// internal-privacy-notice-draft.md) and waits for a specialist's review
// before it replaces this page; until then the page says so plainly.
export default function PrivacyNoticePage() {
    return (
        <AuthFrame>
            <div className="au-card">
                <h1>How your data is handled.</h1>
                <div className="au-panel">
                    <p className="fine">This notice is being written and reviewed. It will cover:</p>
                    <ul className="au-notice-list">
                        <li>what is held about your account, and why</li>
                        <li>what the activity log records, and who sees it</li>
                        <li>how long it is kept, and what happens when you leave</li>
                        <li>your rights, and how to use them</li>
                    </ul>
                    <p className="fine">
                        Questions in the meantime: <a className="au-link" href={`mailto:${business.email}`}>{business.email}</a>
                    </p>
                </div>
                <BackToLogin />
            </div>
        </AuthFrame>
    );
}
