import { Link } from '@/i18n/navigation';
import { business } from '@/lib/business';
import type { LegalDoc } from '@/components/legal/LegalLayout';

// Copy verbatim from Blueprinting/wireframes/public/legal.html (Privacy).
// Moves to the Pages API record at M11 (ticket T11.6); same shape.

const mail = <a href={`mailto:${business.email}`}>{business.email}</a>;

export const privacyEn: LegalDoc = {
    page: 'privacy',
    lang: 'en',
    order: '001',
    ghost: 'Privacy',
    title: 'Privacy policy',
    updated: '2026-06-14',
    short: [
        'What is collected is what you send (the contact form, your project brief, emails) and what a payment needs. Nothing else.',
        'Visit statistics are counted without cookies and without identifying you.',
        'Nothing is sold or shared for advertising, ever.',
        'You can see, correct or delete your data by writing to one address.',
    ],
    sections: [
        {
            id: 'controller',
            label: 'Who is responsible',
            title: 'Who is responsible for your data',
            body: (
                <p>
                    The controller of your personal data, within the meaning of Moroccan law 09-08, is the business that
                    publishes this site. Its registered name and details are on the{' '}
                    <Link href="/legal-notice">legal notice</Link>.
                </p>
            ),
        },
        {
            id: 'data-collected',
            label: 'What is collected',
            title: 'What is collected',
            body: (
                <ul>
                    <li><b>Contact form:</b> your name, email, phone if you give it, and what you write.</li>
                    <li><b>Project brief:</b> the answers you give about your business and your project.</li>
                    <li><b>Payments:</b> the invoice details. Card and account numbers go to the payment provider and are never stored on this site.</li>
                    <li><b>Emails:</b> the messages exchanged about your project.</li>
                    <li><b>Visit statistics:</b> pages viewed, referrer, country and device type, counted in aggregate.</li>
                </ul>
            ),
        },
        {
            id: 'purposes',
            label: 'Why, and on what basis',
            title: 'Why, and on what basis',
            body: (
                <p>
                    To answer your request and prepare a quote (your request), to run the project and invoice it (the
                    contract), to keep accounting records (a legal obligation), and to understand which pages are read (a
                    legitimate interest, with no personal data involved).
                </p>
            ),
        },
        {
            id: 'recipients',
            label: 'Who receives it',
            title: 'Who receives it',
            body: (
                <p>
                    Only the services the work runs on: the payment providers (Stripe, PayPal), the sign-in service used for
                    the owner&rsquo;s own account (Clerk), the email provider, and the host. Each receives only what its job
                    needs.
                </p>
            ),
        },
        {
            id: 'transfers',
            label: 'Transfers outside Morocco',
            title: 'Transfers outside Morocco',
            body: (
                <p>
                    Some of these services are based outside Morocco, so part of your data is processed abroad. These
                    transfers are made under the authorisation of the CNDP (Commission nationale de contrôle de la protection
                    des données à caractère personnel). <span className="pending">Authorisation reference pending.</span>
                </p>
            ),
        },
        {
            id: 'retention',
            label: 'How long it is kept',
            title: 'How long it is kept',
            body: (
                <p>
                    A request that leads to no project: 12 months after the last message. A project: for as long as it runs,
                    then as long as accounting law requires for invoices. Visit statistics hold nothing personal and are not
                    deleted.
                </p>
            ),
        },
        {
            id: 'cookies',
            label: 'Cookies and statistics',
            title: 'Cookies and statistics',
            body: (
                <p>
                    This site sets no cookies on your device. Statistics are counted without them, which is why there is no
                    cookie banner. The only cookies anywhere on the site belong to the owner&rsquo;s sign-in page, which
                    visitors never reach.
                </p>
            ),
        },
        {
            id: 'security',
            label: 'Security',
            title: 'Security',
            body: (
                <p>
                    Data is encrypted in transit, access is limited to the people who work on your project, and every access
                    to client records is logged.
                </p>
            ),
        },
        {
            id: 'rights',
            label: 'Your rights',
            title: 'Your rights',
            body: (
                <p>
                    Under law 09-08 you can access the data held about you, have it corrected, and object to its use for
                    legitimate reasons. Write to {mail}; you will get an answer within 30 days. If the answer does not satisfy
                    you, you can refer the matter to the CNDP.
                </p>
            ),
        },
        {
            id: 'cndp',
            label: 'CNDP declaration',
            title: 'CNDP declaration',
            body: (
                <p>
                    Declaration number: <span className="pending">Pending registration.</span> It will be published here, and
                    on the legal notice, as soon as it is issued.
                </p>
            ),
        },
        {
            id: 'changes',
            label: 'Changes',
            title: 'Changes to this policy',
            body: (
                <p>
                    When this policy changes, the date at the top of the page changes with it. A change to what is collected
                    or who receives it is announced by email to active clients before it applies.
                </p>
            ),
        },
        {
            id: 'contact',
            label: 'Contact',
            title: 'Contact',
            body: <p>Any question about your data: {mail}.</p>,
        },
    ],
};
