'use client';

import { clientNewForm, type ClientPick, type ClientStatus, type Language } from '@repo/schemas';
import {
    Button,
    Field,
    Form,
    FormActions,
    FormHead,
    FormNote,
    FormSection,
    FormShell,
    OptionRow,
    Preview,
    PreviewHead,
    PreviewNote,
    PreviewRow,
    PreviewRows,
    SaveFail,
    useReady,
    useSchemaForm,
} from '@repo/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { AppPage } from '@/components/owner/shell/AppPage';
import { CLIENT_STATUS, LANG } from '@/lib/clients/derive';
import { useNewClient } from '@/lib/clients/queries';
import { clashOf, useClientSearch } from '@/lib/projects/create';
import { initials } from '@/lib/projects/derive';

// New client (wireframes/client-new.html, shell/client-new.js): the longer
// of the two doors. New project and Log an enquiry create a client inline
// with name, email and language; this form writes the SAME record, so its
// required set is identical and everything it adds is optional.
//
// Language is required and not defaulted (French by default decides for
// every Moroccan and English-speaking client alike). Status IS defaulted to
// Lead: someone you put on the books before signed work is a lead. The
// first entry goes to their history as a note: it does not start the
// reply clock, because that begins when they answer.

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const LANGS = (['fr', 'ar', 'en'] as const).map((l) => ({
    value: l,
    label: l.toUpperCase(),
})) satisfies readonly { value: Language; label: string }[];

const STATUSES = (Object.keys(CLIENT_STATUS) as ClientStatus[]).map((s) => ({
    value: s,
    label: CLIENT_STATUS[s],
}));

export function ClientNew() {
    const router = useRouter();
    const f = useSchemaForm(clientNewForm, {
        name: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        firstEntry: '',
    });
    const v = f.watch();
    const [lang, setLang] = useState<Language | null>(null);
    const [status, setStatus] = useState<ClientStatus>('lead');
    const [failed, setFailed] = useState(false);
    const [serverClash, setServerClash] = useState<ClientPick | null>(null);
    const create = useNewClient();

    const email = v.email.trim().toLowerCase();
    const byEmail = useClientSearch(EMAIL.test(email) ? email : '', EMAIL.test(email));
    const clash =
        byEmail.data?.find((c) => c.email === email) ??
        (serverClash?.email === email ? serverClash : null);
    // Company is not unique: two people at one firm are two clients. A note, never an error.
    const co = v.company.trim().toLowerCase();
    const byCompany = useClientSearch(co.length > 1 ? co : '', co.length > 1);
    const sameCo = co ? byCompany.data?.find((c) => c.company.toLowerCase() === co) : null;

    const why = missing();
    const ready = useReady(!why && !create.isPending);

    function missing(): string | null {
        if (!v.name.trim()) return 'A client needs a name.';
        if (!email) return 'A client needs an email.';
        if (!EMAIL.test(email)) return 'That email is not valid.';
        if (clash) return 'That email already belongs to a client.';
        if (!lang) return 'Pick the language you will write to them in.';
        return null;
    }

    async function submit() {
        if (missing() || create.isPending) return;
        setFailed(false);
        try {
            const c = await create.mutateAsync({
                name: v.name.trim(),
                company: v.company.trim() || undefined,
                email,
                language: lang!,
                phone: v.phone.trim() || undefined,
                website: v.website.trim() || undefined,
                status,
                firstEntry: v.firstEntry.trim() || undefined,
            });
            // Their own record: the one screen that holds the work and the history together.
            router.push(`/app/clients/${c.id}`);
        } catch (err) {
            const c = clashOf(err);
            if (c) return setServerClash(c);
            setFailed(true);
        }
    }

    const named = v.name.trim();
    return (
        <AppPage title="Clients" kicker="The people the work is for">
            <FormShell>
                <Form form={f} onSubmit={submit} errorWords={{}} className="fm-main" aria-label="New client">
                    <FormHead
                        title="New client"
                        lede="Three things are required: a name, an email and the language you will write to them in. The rest is here because you have it now, not because the record needs it."
                    />

                    <FormSection title="Who they are">
                        <Field name="name" label="Name" icon={ICON.person} autoComplete="off" maxLength={120} />
                        <Field
                            name="company"
                            label="Company (optional)"
                            icon={ICON.company}
                            autoComplete="off"
                            maxLength={120}
                        />
                        {sameCo && (
                            <FormNote>
                                <b>{sameCo.name}</b> is already filed under {sameCo.company}. Two people
                                at one firm are two clients here: carry on if this is someone else.
                            </FormNote>
                        )}
                        <Field
                            name="email"
                            label="Email"
                            type="email"
                            icon={ICON.mail}
                            autoComplete="off"
                            maxLength={254}
                        />
                        {clash && (
                            <FormNote>
                                <b>{clash.name}</b> already has this email.{' '}
                                <Link className="fm-link" href={`/app/clients/${clash.id}`}>
                                    Open that client instead
                                </Link>
                            </FormNote>
                        )}
                        <Field
                            name="phone"
                            label="Phone (optional)"
                            type="tel"
                            icon={ICON.phone}
                            autoComplete="off"
                            maxLength={40}
                        />
                        <Field
                            name="website"
                            label="Website (optional)"
                            icon={ICON.globe}
                            autoComplete="off"
                            maxLength={200}
                        />
                    </FormSection>

                    <FormSection title="Their language">
                        <OptionRow label="Writes to them in" value={lang} options={LANGS} onChange={setLang} />
                        <FormNote>
                            Intake questions, the brief they read back, and quote and invoice
                            documents are written in this. Nothing else changes.
                        </FormNote>
                    </FormSection>

                    <FormSection title="Where they stand">
                        <OptionRow
                            label="Filed as"
                            value={status}
                            options={STATUSES}
                            onChange={(s) => s && setStatus(s)}
                        />
                        <FormNote>
                            Your judgement, stored. What the work says is worked out separately, and
                            the two are shown side by side rather than reconciled.
                        </FormNote>
                    </FormSection>

                    <FormSection title="First entry">
                        <Field
                            name="firstEntry"
                            className="pn-note-f"
                            label="How they got in touch (optional)"
                            icon={ICON.note}
                            multiline
                            maxLength={500}
                        />
                        <FormNote>
                            Goes to their history as your first entry. It does not start the reply
                            clock: that begins when they answer.
                        </FormNote>
                    </FormSection>

                    <SaveFail show={failed} />
                    <FormActions req={why}>
                        <Button variant="quiet" asChild>
                            <Link href="/app/clients">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={!!why}
                            loading={create.isPending}
                            loadingLabel="Creating…"
                            {...ready}
                        >
                            {failed ? 'Try again' : 'Create client'}
                        </Button>
                    </FormActions>
                </Form>

                <Preview title="What this creates">
                    <PreviewHead
                        avatar={
                            <span className="b-av b-av--lg" aria-hidden="true">
                                {named ? initials(named) : ' '}
                            </span>
                        }
                        name={named}
                        empty="Their name goes here"
                        sub={v.company.trim() || 'No company'}
                    />
                    <PreviewRows>
                        <PreviewRow k="Filed as">{CLIENT_STATUS[status]}</PreviewRow>
                        <PreviewRow k="The work says">Nothing signed</PreviewRow>
                        <PreviewRow k="Writes to them in" empty={!lang}>
                            {lang ? LANG[lang] : '—'}
                        </PreviewRow>
                        <PreviewRow k="Email" empty={!email}>
                            {email || '—'}
                        </PreviewRow>
                        <PreviewRow k="History" empty={!v.firstEntry.trim()}>
                            {v.firstEntry.trim() ? 'One note' : '—'}
                        </PreviewRow>
                    </PreviewRows>
                    <PreviewNote>
                        Value and Outstanding start empty and stay Finance’s. Nothing about this
                        record is money.
                    </PreviewNote>
                </Preview>
            </FormShell>
        </AppPage>
    );
}

const svg = (body: ReactNode) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {body}
    </svg>
);

const ICON = {
    person: svg(
        <>
            <circle cx="10" cy="7" r="3" />
            <path d="M4 17c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        </>
    ),
    mail: svg(
        <>
            <rect x="2.5" y="4.5" width="15" height="11" />
            <path d="m2.5 6 7.5 5 7.5-5" />
        </>
    ),
    company: svg(
        <>
            <path d="M3.5 17.5v-12l6-3v15" />
            <path d="M9.5 8.5h7v9" />
            <path d="M12 11.5h2M12 14.5h2M6 7.5h1M6 10.5h1M6 13.5h1" />
        </>
    ),
    phone: svg(<path d="M5 3.5h3l1.5 4-2 1.2a9 9 0 0 0 3.8 3.8l1.2-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A13.5 13.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" />),
    globe: svg(
        <>
            <circle cx="10" cy="10" r="7" />
            <path d="M3 10h14M10 3c2 2.2 2.8 4.5 2.8 7s-.8 4.8-2.8 7c-2-2.2-2.8-4.5-2.8-7S8 5.2 10 3Z" />
        </>
    ),
    note: svg(
        <>
            <path d="M4.5 3.5h11v13h-11z" />
            <path d="M7 7h6M7 10h6M7 13h3.5" />
        </>
    ),
};
