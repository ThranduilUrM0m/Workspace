import { Link } from '@/i18n/navigation';
import { business } from '@/lib/business';
import type { LegalDoc } from '@/components/legal/LegalLayout';

// Copy verbatim from Blueprinting/wireframes/public/legal.html (Terms).
// Draft built from boutaleb.md (ProjectPlan approval, ChangeRequest, refund
// policy, stalled clients). Not legal advice: a lawyer reads it before
// launch. Moves to the Pages API record at M11 (ticket T11.6); same shape.

const mail = <a href={`mailto:${business.email}`}>{business.email}</a>;

export const termsEn: LegalDoc = {
    page: 'terms',
    lang: 'en',
    order: '002',
    ghost: 'Terms',
    title: 'Terms of service',
    description:
        'How a project runs: the written plan, changes, payment by milestone, refunds, who owns what, the 30-day bug fix and the law that applies.',
    updated: '2026-06-14',
    short: [
        'Nothing starts until you have approved a written project plan: scope, milestones, price.',
        'A change, even a small one, gets its own short approval, so both sides keep a record.',
        'Bugs in what was delivered are fixed free for 30 days.',
        'You pay in advance, milestone by milestone, through Stripe or PayPal.',
        'Early on a full refund is possible; once the work is underway, the amount is talked through and agreed.',
    ],
    sections: [
        {
            id: 't-who',
            label: 'Who you are dealing with',
            title: 'Who you are dealing with',
            body: (
                <p>
                    These terms are between you and the business that publishes this site. Its registered details are on the{' '}
                    <Link href="/legal-notice">legal notice</Link>.
                </p>
            ),
        },
        {
            id: 't-scope',
            label: 'What these terms cover',
            title: 'What these terms cover',
            body: (
                <p>
                    Every website, platform or internal tool built for you, and the support that follows. Where a signed
                    project plan says something different, the plan wins for that project.
                </p>
            ),
        },
        {
            id: 't-plan',
            label: 'The project plan',
            title: 'The project plan',
            body: (
                <p>
                    After your brief, you receive a project plan: what will be built, in which milestones, by when, and for how
                    much. Work starts when you approve it. If the plan is corrected later, a new version replaces it and needs
                    your approval again; the old one is kept, marked as superseded.
                </p>
            ),
        },
        {
            id: 't-changes',
            label: 'Changes along the way',
            title: 'Changes along the way',
            body: (
                <p>
                    Any change to the approved scope goes through a short change request: what changes, what it costs if
                    anything, and how it moves the dates. It is there to keep a record and avoid misunderstandings later, not
                    to charge for every detail.
                </p>
            ),
        },
        {
            id: 't-pay',
            label: 'Payment',
            title: 'Payment',
            body: (
                <ul>
                    <li>Each milestone is paid before it starts. The first one is paid on approving the plan.</li>
                    <li>Payment goes through Stripe or PayPal; card and account numbers never reach this site.</li>
                    <li>Invoices are issued for every payment. Prices are in Moroccan dirhams (MAD); euros on request.</li>
                </ul>
            ),
        },
        {
            id: 't-refund',
            label: 'Refunds',
            title: 'Refunds',
            body: (
                <>
                    <p>
                        A refund follows how far the work has gone, not a fixed percentage. Before the groundwork of the
                        project exists, roughly the first fifth of it, a full refund is generally possible. Once milestones
                        are underway, the amount is agreed between both sides.
                    </p>
                    <p>
                        Where a project is used to obtain free advice with no intention of going ahead, the work already done
                        is not refunded. No refund is final until you have confirmed it in writing.
                    </p>
                </>
            ),
        },
        {
            id: 't-yours',
            label: 'Your part',
            title: 'Your part',
            body: (
                <p>
                    You provide the content, access and answers the plan depends on, and you confirm you have the right to use
                    what you send: text, images, logos, data. Delays on your side move the dates by the same amount.
                </p>
            ),
        },
        {
            id: 't-pause',
            label: 'When a project goes quiet',
            title: 'When a project goes quiet',
            body: (
                <p>
                    If the work is waiting on you and nothing is heard, you get one reminder. After that the project is
                    paused, not cancelled; it picks up where it stopped when you come back, within 6 months. After that,
                    restarting it is quoted again.
                </p>
            ),
        },
        {
            id: 't-own',
            label: 'Who owns what',
            title: 'Who owns what',
            body: (
                <p>
                    Once a milestone is paid, what it delivered is yours. Tools, libraries and code reused across projects stay
                    with the business or their authors, and you get a permanent licence to use them in your project. The
                    finished work may be shown in the portfolio unless you ask otherwise.
                </p>
            ),
        },
        {
            id: 't-after',
            label: 'After delivery',
            title: 'After delivery',
            body: (
                <p>
                    Bugs in what was delivered are fixed free of charge for 30 days after the last milestone. New features and
                    ongoing support are quoted separately.
                </p>
            ),
        },
        {
            id: 't-liab',
            label: 'Limits of liability',
            title: 'Limits of liability',
            body: (
                <p>
                    The business is responsible for the work it delivers, up to the amount you paid for the project. It is not
                    responsible for losses caused by third-party services the project relies on (hosts, payment providers,
                    sign-in services), or by changes made by anyone else after delivery.
                </p>
            ),
        },
        {
            id: 't-law',
            label: 'Law and disputes',
            title: 'Law and disputes',
            body: (
                <p>
                    These terms are governed by Moroccan law. Before anything else, both sides try to settle a disagreement by
                    talking it through; failing that, the courts of Tangier have jurisdiction. Questions: {mail}.
                </p>
            ),
        },
    ],
};
