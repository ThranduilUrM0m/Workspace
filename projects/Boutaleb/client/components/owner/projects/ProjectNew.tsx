'use client';

import { projectNewForm, slugify, type ClientPick, type Language, type ProjectNewForm } from '@repo/schemas';
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
    Picked,
    Picker,
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
import { clashOf, slugTaken, useClientSearch, useCreateClient, useCreateProject } from '@/lib/projects/create';
import { initials } from '@/lib/projects/derive';
import { useProjects } from '@/lib/projects/queries';

// Create a project (wireframes/shell/project-new.js, spec 2026-09-04-02).
// NOTHING ELSE CREATES A PROJECT: a lead that arrived by email, a DM or a
// call enters the system here, so the system is not bypassed on day one.
// Two things make it real, whose it is and what it is called; everything
// else is decided later, on the project itself.
//
// Whose it is has three answers in one list: a client that exists, a new
// one (created here, saved to Clients as a lead, not a copy), or nobody
// (an idea). The intake link is not sent from here yet: client links
// arrive with M8, and a box that sends nothing would be a lie.

type Mode = 'search' | 'picked' | 'new' | 'own';

const LANGS = [
    { value: 'fr', label: 'FR' },
    { value: 'ar', label: 'AR' },
    { value: 'en', label: 'EN' },
] as const satisfies readonly { value: Language; label: string }[];

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const NAME_MAX = 120;

export function ProjectNew() {
    const router = useRouter();
    const form = useSchemaForm(projectNewForm, { name: '', note: '', clientName: '', clientEmail: '', clientCompany: '' });
    const v = form.watch();

    const [mode, setMode] = useState<Mode>('search');
    const [client, setClient] = useState<ClientPick | null>(null);
    const [query, setQuery] = useState('');
    const [lang, setLang] = useState<Language | null>(null);
    const [slug, setSlug] = useState({ touched: false, editing: false, value: '' });
    const [failed, setFailed] = useState<'save' | 'project' | null>(null);
    const [serverClash, setServerClash] = useState<ClientPick | null>(null);
    const [serverSlugTaken, setServerSlugTaken] = useState<string | null>(null);

    const projects = useProjects().data ?? [];
    const search = useClientSearch(query, mode === 'search');
    const email = v.clientEmail.trim().toLowerCase();
    const byEmail = useClientSearch(EMAIL.test(email) ? email : '', mode === 'new' && EMAIL.test(email));
    const clash = mode === 'new' ? (byEmail.data?.find((c) => c.email === email) ?? (serverClash?.email === email ? serverClash : null)) : null;

    const createClient = useCreateClient();
    const createProject = useCreateProject();
    const busy = createClient.isPending || createProject.isPending;

    // The slug follows the name until it is edited by hand; a derived one bumps on collision, a typed one is flagged.
    const taken = (s: string) => projects.some((p) => p.slug === s) || serverSlugTaken === s;
    const derived = freeSlug(slugify(v.name), taken);
    const theSlug = slug.touched ? slug.value : derived;

    const pick = (c: ClientPick) => {
        setClient(c);
        setMode('picked');
        setServerClash(null);
        if (!form.getValues('name').trim()) form.setValue('name', c.company || c.name);
    };
    const change = () => {
        setClient(null);
        setMode('search');
        setQuery('');
    };

    const why = missing();
    const ready = useReady(!why && !busy);

    function missing(): string | null {
        if (mode === 'new') {
            if (!v.clientName.trim()) return 'The new client needs a name.';
            if (!email) return 'The new client needs an email.';
            if (!EMAIL.test(email)) return 'That email is not valid.';
            if (clash) return 'That email already belongs to a client.';
            if (!lang) return 'Pick the language you will write to them in.';
        } else if (mode === 'search') {
            return 'Pick a client, or create one.';
        }
        if (v.name.trim().length < 3) return 'The project needs a name.';
        if (!theSlug) return 'The project needs a slug.';
        if (slug.touched && taken(theSlug)) return 'That slug is already taken.';
        return null;
    }

    async function submit() {
        if (missing() || busy) return;
        setFailed(null);
        let owner = mode === 'picked' ? client : null;
        try {
            if (mode === 'new') {
                // Saved first, and kept: if the project then fails, a retry reuses this client.
                owner = await createClient.mutateAsync({ name: v.clientName.trim(), company: v.clientCompany.trim() || undefined, email, language: lang! });
                setClient(owner);
                setMode('picked');
            }
        } catch (err) {
            const c = clashOf(err);
            if (c) return setServerClash(c);
            return setFailed('save');
        }
        try {
            const p = await createProject.mutateAsync({
                name: v.name.trim(),
                governingLanguage: owner?.language ?? 'en',
                clientId: owner?.id ?? null,
                slug: slug.touched ? theSlug : undefined,
                note: v.note.trim() || undefined,
                currency: 'MAD',
            });
            // The project's own screen, not the list: the question now is what THIS one needs.
            router.push(`/app/projects/${p.id}`);
        } catch (err) {
            if (slugTaken(err)) {
                setServerSlugTaken(theSlug);
                setSlug({ touched: true, editing: true, value: theSlug });
                return;
            }
            setFailed(mode === 'new' ? 'project' : 'save');
        }
    }

    const own = mode === 'own';
    const draft = mode === 'new' && v.clientName.trim() ? { name: v.clientName.trim(), company: v.clientCompany.trim() } : null;

    return (
        <AppPage title="Projects" kicker="Start one">
            <FormShell>
                <Form form={form} onSubmit={submit} errorWords={{}} className="fm-main" aria-label="New project">
                    <FormHead
                        title="New project"
                        lede="A lead arrived, or an idea did. Two things make it real; everything else is decided later, on the project itself."
                        msg={failed === 'project' ? 'The client was saved. The project was not.' : null}
                        tone={failed ? 'err' : undefined}
                    />

                    <FormSection title="Client">
                        {mode === 'search' && (
                            <Picker
                                label="Search or create a client"
                                icon={ICON.search}
                                query={query}
                                onQuery={setQuery}
                                items={(search.data ?? []).slice(0, query.trim() ? 8 : 5)}
                                loading={search.isPending}
                                itemKey={(c) => c.id}
                                onPick={pick}
                                renderItem={(c) => (
                                    <>
                                        <span className="b-av b-av--md" aria-hidden="true">
                                            {initials(c.name)}
                                        </span>
                                        <span className="fm-pick-name">{c.name}</span>
                                        <span className="fm-pick-meta">
                                            {c.company && c.company !== c.name ? c.company : null}
                                            <span className="tag">{c.self ? 'Studio' : c.status === 'lead' ? 'Lead' : 'Active'}</span>
                                        </span>
                                    </>
                                )}
                                exits={[
                                    {
                                        key: 'create',
                                        icon: '+',
                                        label: query.trim() ? (
                                            <>
                                                Create <b>“{query.trim()}”</b> as a new client
                                            </>
                                        ) : (
                                            'Create a new client'
                                        ),
                                        onSelect: () => {
                                            form.setValue('clientName', query.trim());
                                            setMode('new');
                                        },
                                    },
                                    { key: 'own', icon: ICON.spark, label: 'No client, my own idea', onSelect: () => setMode('own') },
                                ]}
                            />
                        )}
                        {mode === 'picked' && client && (
                            <Picked
                                avatar={
                                    <span className="b-av b-av--md" aria-hidden="true">
                                        {initials(client.name)}
                                    </span>
                                }
                                name={client.name}
                                meta={[client.company !== client.name ? client.company : null, client.email].filter(Boolean).join(' · ')}
                                onChange={change}
                            />
                        )}
                        {own && <Picked own name="Yours" meta="no client on this one yet" onChange={change} />}
                        {mode === 'new' && (
                            <div className="fm-newc">
                                <div className="fm-newc-head">
                                    <span>New client, saved to Clients as a lead</span>
                                    <button type="button" className="fm-link" onClick={change}>
                                        Cancel
                                    </button>
                                </div>
                                <Field name="clientName" label="Name" icon={ICON.person} autoComplete="off" maxLength={120} />
                                <Field name="clientEmail" label="Email" type="email" icon={ICON.mail} autoComplete="off" maxLength={254} />
                                {clash && (
                                    <FormNote>
                                        <b>{clash.name}</b> already has this email.{' '}
                                        <button type="button" className="fm-link" onClick={() => pick(clash)}>
                                            Use that client instead
                                        </button>
                                    </FormNote>
                                )}
                                <Field name="clientCompany" label="Company (optional)" icon={ICON.company} className="fm-span" autoComplete="off" maxLength={120} />
                                <OptionRow className="fm-span" label="Writes to them in" value={lang} options={LANGS} onChange={setLang} />
                            </div>
                        )}
                    </FormSection>

                    <FormSection title="Project">
                        <Field name="name" label="Project name" icon={ICON.tag} autoComplete="off" maxLength={NAME_MAX} />
                        {v.name.length > NAME_MAX - 20 && (
                            <p className="pn-count">
                                {v.name.length} / {NAME_MAX}
                            </p>
                        )}
                        <SlugLine
                            value={theSlug}
                            taken={slug.touched && !!theSlug && taken(theSlug)}
                            editing={slug.editing}
                            touched={slug.touched}
                            onEdit={() => setSlug({ touched: true, editing: true, value: theSlug })}
                            onType={(s) => setSlug({ touched: true, editing: true, value: slugify(s) })}
                            onDone={() => setSlug((s) => ({ ...s, editing: false }))}
                            onReset={() => setSlug({ touched: false, editing: false, value: '' })}
                        />
                        <Field name="note" label="What they've told you so far (optional)" icon={ICON.note} multiline maxLength={2000} className="pn-note-f" />
                        <FormNote>Kept on the project as where it started. Not the brief: the intake collects that.</FormNote>
                    </FormSection>

                    {!own && (
                        <FormSection title="Intake link">
                            <FormNote>
                                {client?.self
                                    ? 'Internal project: nothing to collect, so no questionnaire goes out.'
                                    : 'Sent from the project once client links are switched on. Nothing goes out from this screen yet.'}
                            </FormNote>
                        </FormSection>
                    )}

                    <SaveFail show={failed === 'save'} />
                    <FormActions req={why}>
                        <Button variant="quiet" asChild>
                            <Link href="/app/projects">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={!!why} loading={busy} loadingLabel="Creating…" {...ready}>
                            {failed ? 'Try again' : 'Create project'}
                        </Button>
                    </FormActions>
                </Form>

                <Preview title="What this creates">
                    <PreviewHead
                        avatar={
                            <span className="b-av b-av--lg" aria-hidden="true">
                                {v.name.trim() ? initials(v.name) : ' '}
                            </span>
                        }
                        name={v.name.trim()}
                        empty="Nothing named yet"
                        sub={theSlug ? `/projects/${theSlug}` : '/projects/…'}
                    />
                    <PreviewRows>
                        <PreviewRow k="Client" empty={!own && !client && !draft} watch={`${mode}:${client?.id ?? draft?.name ?? ''}`}>
                            {own ? 'Yours' : client ? withCompany(client.name, client.company) : draft ? <NewClient name={draft.name} company={draft.company} /> : '—'}
                        </PreviewRow>
                        <PreviewRow k="Status">{own ? 'Idea' : 'Intake pending'}</PreviewRow>
                        <PreviewRow k="Brief" empty={own}>
                            {own ? '—' : 'Not started'}
                        </PreviewRow>
                        <PreviewRow k="Note" empty={!v.note.trim()}>
                            {v.note.trim() ? 'Kept on the project' : '—'}
                        </PreviewRow>
                        <PreviewRow k="Modules">Quotes, invoices, payments</PreviewRow>
                        {!own && (
                            <PreviewRow k="Intake link" empty>
                                Not sent. Issued from the project.
                            </PreviewRow>
                        )}
                        <PreviewRow k="Tickets" empty>
                            —
                        </PreviewRow>
                        <PreviewRow k="Value" empty>
                            —
                        </PreviewRow>
                    </PreviewRows>
                    <PreviewNote>
                        {own
                            ? 'An idea carries no client, no brief and no money. Attach a client when there is one, and the rest follows from there.'
                            : 'A new project carries no tickets, no quote and no milestones. Those arrive from the plan, once the brief is approved.'}
                    </PreviewNote>
                </Preview>
            </FormShell>
        </AppPage>
    );
}

/** On collision a derived slug bumps (-2, -3…), so the common case needs no typing. */
function freeSlug(base: string, taken: (s: string) => boolean): string {
    if (!base || !taken(base)) return base;
    let n = 2;
    while (taken(`${base}-${n}`)) n++;
    return `${base}-${n}`;
}

function withCompany(name: string, company: string) {
    return company && company !== name ? `${name} · ${company}` : name;
}

function NewClient({ name, company }: { name: string; company: string }) {
    return (
        <>
            {withCompany(name, company)} <span className="pn-new">new, as a lead</span>
        </>
    );
}

/** The slug is visible and editable: it is in the URL of every project screen, and a user who cannot see it cannot fix it. */
function SlugLine(p: { value: string; taken: boolean; editing: boolean; touched: boolean; onEdit: () => void; onType: (s: string) => void; onDone: () => void; onReset: () => void }) {
    return (
        <div className="pn-slug">
            <span>/projects/</span>
            {p.editing ? (
                <input className="pn-slug-in" aria-label="Slug" value={p.value} onChange={(e) => p.onType(e.target.value)} autoComplete="off" autoFocus />
            ) : (
                <span className="pn-slug-val" data-empty={p.value ? undefined : ''}>
                    {p.value || '…'}
                </span>
            )}
            {p.taken && <span className="pn-slug-warn">Taken</span>}
            <button type="button" className="fm-link" onClick={p.editing ? p.onDone : p.onEdit}>
                {p.editing ? 'Done' : 'Edit'}
            </button>
            {p.touched && !p.editing && (
                <button type="button" className="fm-link" onClick={p.onReset}>
                    Reset
                </button>
            )}
        </div>
    );
}

const svg = (body: ReactNode) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        {body}
    </svg>
);

const ICON = {
    search: svg(
        <>
            <circle cx="9" cy="9" r="5.5" />
            <path d="m17 17-3.2-3.2" />
        </>,
    ),
    person: svg(
        <>
            <circle cx="10" cy="7" r="3" />
            <path d="M4 17c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        </>,
    ),
    mail: svg(
        <>
            <rect x="2.5" y="4.5" width="15" height="11" />
            <path d="m2.5 6 7.5 5 7.5-5" />
        </>,
    ),
    company: svg(
        <>
            <path d="M3.5 17.5v-12l6-3v15" />
            <path d="M9.5 8.5h7v9" />
            <path d="M12 11.5h2M12 14.5h2M6 7.5h1M6 10.5h1M6 13.5h1" />
        </>,
    ),
    tag: svg(
        <>
            <path d="M3.5 3.5h6l7 7-6 6-7-7v-6Z" />
            <circle cx="6.8" cy="6.8" r="1.1" />
        </>,
    ),
    note: svg(
        <>
            <path d="M4.5 3.5h11v13h-11z" />
            <path d="M7 7h6M7 10h6M7 13h3.5" />
        </>,
    ),
    spark: svg(
        <>
            <circle cx="10" cy="10" r="3.25" />
            <path d="M10 2.5v1.75M10 15.75v1.75M2.5 10h1.75M15.75 10h1.75" />
        </>,
    ),
};
