// The notice to the owner after an enquiry (public-forms.md §5): plain
// text, because it is read by one person who wants the facts, not a
// design. It also proves, every time it arrives, that sending still works
// (an Always Free sender left idle can be reclaimed silently).

export type OwnerNoticeProps = {
    /** A new enquiry, or a /contact addition to an earlier footer send. */
    kind: 'new' | 'details';
    name: string;
    email: string;
    source: 'footer' | 'contact';
    message: string;
    answers: { label: string; value: string }[];
    /** Where the owner reads it in the ERP. */
    link: string;
};

export function renderOwnerNotice(p: OwnerNoticeProps) {
    const subject = p.kind === 'new' ? `New enquiry: ${p.name}` : `${p.name} added budget and timeline`;
    const lines = [
        p.kind === 'new' ? `${p.name} wrote through the ${p.source === 'footer' ? 'footer form' : '/contact form'}.` : `${p.name} added detail through /contact.`,
        '',
        `Email: ${p.email}`,
        ...p.answers.map((a) => `${a.label}: ${a.value}`),
        '',
        p.message,
        '',
        `Open it: ${p.link}`,
        `Replying to this email answers ${p.name} at ${p.email}.`,
    ];
    return { subject, text: lines.join('\n') };
}
