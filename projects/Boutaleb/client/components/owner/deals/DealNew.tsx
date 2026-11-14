'use client';

import {
    DEAL_SOURCES,
    dealNewForm,
    type ClientPick,
    type DealSource,
    type Language,
} from '@repo/schemas';
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
import { SOURCE } from '@/lib/deals/derive';
import { useCreateDeal, useDeals } from '@/lib/deals/queries';
import { clashOf, useClientSearch } from '@/lib/projects/create';
import { cash, initials } from '@/lib/projects/derive';

// Log an enquiry (wireframes/deal-new.html, shell/deal-new.js): a Deal at
// stage `lead`. The client is required and there is no way around it (a
// deal is a counterparty), so the picker has two exits, not three. Four
// questions, each knowable the moment the enquiry lands: what is it, who is
// it for, where did it come from, what did they say. Value is optional and
// a guess. Source is required and not defaulted: a wrong default would
// quietly poison the one answer only this screen collects.
//
// A new client is sent with the deal in ONE request, so a refused deal never
// leaves a client behind.

type Mode = 'search' | 'picked' | 'new';

const LANGS = [
    { value: 'fr', label: 'FR' },
    { value: 'ar', label: 'AR' },
    { value: 'en', label: 'EN' },
] as const satisfies readonly { value: Language; label: string }[];

const SOURCES = DEAL_SOURCES.map((s) => ({
    value: s,
    label: SOURCE[s].label,
    note: SOURCE[s].note,
}));

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** "48 000" or "48000 MAD" -> 48000; anything without a positive whole number -> null. */
export const money = (v: string) => {
    const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) || n <= 0 ? null : n;
};

export function DealNew() {
    const router = useRouter();
    const f = useSchemaForm(dealNewForm, {
        title: '',
        value: '',
        note: '',
        clientName: '',
        clientEmail: '',
        clientCompany: '',
    });
    const v = f.watch();

    const [mode, setMode] = useState<Mode>('search');
    const [client, setClient] = useState<ClientPick | null>(null);
    const [query, setQuery] = useState('');
    const [lang, setLang] = useState<Language | null>(null);
    const [source, setSource] = useState<DealSource | null>(null);
    const [failed, setFailed] = useState(false);
    const [serverClash, setServerClash] = useState<ClientPick | null>(null);

    const deals = useDeals().data ?? [];
    const search = useClientSearch(query, mode === 'search');
    const email = v.clientEmail.trim().toLowerCase();
    const byEmail = useClientSearch(
        EMAIL.test(email) ? email : '',
        mode === 'new' && EMAIL.test(email)
    );
    const clash =
        mode === 'new'
            ? (byEmail.data?.find((c) => c.email === email) ??
              (serverClash?.email === email ? serverClash : null))
            : null;
    const create = useCreateDeal();

    const dealsWith = (id: string) => deals.filter((d) => d.client.id === id);
    // You do not sell to yourself: the studio's own record is not a counterparty.
    const pickable = (search.data ?? []).filter((c) => !c.self);

    const pick = (c: ClientPick) => {
        setClient(c);
        setMode('picked');
        setServerClash(null);
    };
    const change = () => {
        setClient(null);
        setMode('search');
        setQuery('');
    };

    const why = missing();
    const ready = useReady(!why && !create.isPending);

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
        if (v.title.trim().length < 3) return 'The deal needs a name.';
        if (!source) return 'Say where this came from.';
        return null;
    }

    async function submit() {
        if (missing() || create.isPending) return;
        setFailed(false);
        try {
            const d = await create.mutateAsync({
                ...(mode === 'picked' && client
                    ? { clientId: client.id }
                    : {
                          newClient: {
                              name: v.clientName.trim(),
                              company: v.clientCompany.trim() || undefined,
                              email,
                              language: lang!,
                          },
                      }),
                title: v.title.trim(),
                value: money(v.value),
                source: source!,
                note: v.note.trim() || undefined,
            });
            // The deal's own screen: the question now is what this one needs.
            router.push(`/app/deals/${d.id}`);
        } catch (err) {
            const c = clashOf(err);
            if (c) return setServerClash(c);
            setFailed(true);
        }
    }

    const repeat = client && dealsWith(client.id).some((d) => d.stage === 'won');
    const draft =
        mode === 'new' && v.clientName.trim()
            ? { name: v.clientName.trim(), company: v.clientCompany.trim() }
            : null;
    const val = money(v.value);

    return (
        <AppPage title="Deals" kicker="Somebody asked, and nothing is signed">
            <FormShell>
                <Form
                    form={f}
                    onSubmit={submit}
                    errorWords={{}}
                    className="fm-main"
                    aria-label="Log an enquiry"
                >
                    <FormHead
                        title="Log an enquiry"
                        lede="Somebody asked. Three answers put it in the funnel; everything else (the offer, the price they actually see, the contract) is decided later, on the deal itself."
                    />

                    <FormSection title="Client">
                        {mode === 'search' && (
                            <Picker
                                label="Search or create a client"
                                icon={ICON.search}
                                query={query}
                                onQuery={setQuery}
                                items={pickable.slice(0, query.trim() ? 8 : 5)}
                                loading={search.isPending}
                                itemKey={(c) => c.id}
                                onPick={pick}
                                renderItem={(c) => {
                                    const n = dealsWith(c.id).length;
                                    return (
                                        <>
                                            <span className="b-av b-av--md" aria-hidden="true">
                                                {initials(c.name)}
                                            </span>
                                            <span className="fm-pick-name">{c.name}</span>
                                            <span className="fm-pick-meta">
                                                {c.company && c.company !== c.name
                                                    ? c.company
                                                    : null}
                                                {/* How many deals you already have with them: the fact that tells two similar names apart here. */}
                                                <span className="tag">
                                                    {n
                                                        ? `${n} ${n === 1 ? 'deal' : 'deals'}`
                                                        : 'No deals yet'}
                                                </span>
                                            </span>
                                        </>
                                    );
                                }}
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
                                            f.setValue('clientName', query.trim());
                                            setMode('new');
                                        },
                                    },
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
                                meta={[
                                    client.company !== client.name ? client.company : null,
                                    client.email,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                onChange={change}
                            />
                        )}
                        {mode === 'new' && (
                            <div className="fm-newc">
                                <div className="fm-newc-head">
                                    <span>New client, saved to Clients as a lead</span>
                                    <button type="button" className="fm-link" onClick={change}>
                                        Cancel
                                    </button>
                                </div>
                                <Field
                                    name="clientName"
                                    label="Name"
                                    icon={ICON.person}
                                    autoComplete="off"
                                    maxLength={120}
                                />
                                <Field
                                    name="clientEmail"
                                    label="Email"
                                    type="email"
                                    icon={ICON.mail}
                                    autoComplete="off"
                                    maxLength={254}
                                />
                                {clash && (
                                    <FormNote>
                                        <b>{clash.name}</b> already has this email.{' '}
                                        <button
                                            type="button"
                                            className="fm-link"
                                            onClick={() => pick(clash)}
                                        >
                                            Use that client instead
                                        </button>
                                    </FormNote>
                                )}
                                <Field
                                    name="clientCompany"
                                    label="Company (optional)"
                                    icon={ICON.company}
                                    className="fm-span"
                                    autoComplete="off"
                                    maxLength={120}
                                />
                                <OptionRow
                                    className="fm-span"
                                    label="Writes to them in"
                                    value={lang}
                                    options={LANGS}
                                    onChange={setLang}
                                />
                            </div>
                        )}
                    </FormSection>

                    <FormSection title="The deal">
                        <Field
                            name="title"
                            label="What they want"
                            icon={ICON.tag}
                            autoComplete="off"
                            maxLength={120}
                        />
                        <FormNote>
                            A short name you will recognise in a list of twenty: “Spa site and
                            booking”, not “Website enquiry”.
                        </FormNote>
                        <Field
                            name="value"
                            className="pn-note-f"
                            label="Rough value in MAD (optional)"
                            icon={ICON.money}
                            autoComplete="off"
                            inputMode="numeric"
                            maxLength={14}
                        />
                        <FormNote>
                            A guess is useful and a blank is honest. It stays marked an{' '}
                            <b>estimate</b> until a proposal goes out.
                        </FormNote>
                        <Field
                            name="note"
                            className="pn-note-f"
                            label="What they said (optional)"
                            icon={ICON.note}
                            multiline
                            maxLength={2000}
                        />
                        <FormNote>
                            Kept on the deal as where it started. Not the brief: the intake collects
                            that, later, if this turns into work.
                        </FormNote>
                    </FormSection>

                    <FormSection title="Where it came from">
                        <OptionRow
                            label="Source"
                            value={source}
                            options={SOURCES.map((s) => ({ value: s.value, label: s.label }))}
                            onChange={setSource}
                        />
                        <FormNote>
                            {source
                                ? SOURCE[source].note
                                : 'Knowable only now: in three weeks nobody remembers whether this was a referral.'}
                        </FormNote>
                        {repeat && source !== 'repeat' && (
                            <FormNote>
                                You have already won work with {client!.name}: <b>Repeat</b> is
                                probably the honest answer here.
                            </FormNote>
                        )}
                    </FormSection>

                    <SaveFail show={failed} />
                    <FormActions req={why}>
                        <Button variant="quiet" asChild>
                            <Link href="/app/deals/leads">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={!!why}
                            loading={create.isPending}
                            loadingLabel="Logging…"
                            {...ready}
                        >
                            {failed ? 'Try again' : 'Log the enquiry'}
                        </Button>
                    </FormActions>
                </Form>

                <Preview title="What this creates">
                    <PreviewHead
                        avatar={
                            <span className="b-av b-av--lg" aria-hidden="true">
                                {(client?.name ?? draft?.name)
                                    ? initials(client?.name ?? draft!.name)
                                    : ' '}
                            </span>
                        }
                        name={v.title.trim()}
                        empty="Nothing named yet"
                        sub={client?.name ?? draft?.name ?? 'No client yet'}
                    />
                    <PreviewRows>
                        <PreviewRow
                            k="Client"
                            empty={!client && !draft}
                            watch={`${mode}:${client?.id ?? draft?.name ?? ''}`}
                        >
                            {client ? (
                                withCompany(client.name, client.company)
                            ) : draft ? (
                                <NewClient name={draft.name} company={draft.company} />
                            ) : (
                                '—'
                            )}
                        </PreviewRow>
                        <PreviewRow k="Stage">Lead</PreviewRow>
                        <PreviewRow k="Value" empty={!val}>
                            {val ? `${cash(val)}, estimate` : '—'}
                        </PreviewRow>
                        <PreviewRow k="Source" empty={!source}>
                            {source ? SOURCE[source].label : '—'}
                        </PreviewRow>
                        <PreviewRow k="Your move">Draft proposal</PreviewRow>
                        <PreviewRow k="Opened">Today</PreviewRow>
                        <PreviewRow k="Note" empty={!v.note.trim()}>
                            {v.note.trim() ? 'Kept on the deal' : '—'}
                        </PreviewRow>
                        <PreviewRow k="Documents" empty>
                            —
                        </PreviewRow>
                    </PreviewRows>
                    <PreviewNote>
                        A lead carries no proposal, no contract and no money anybody has agreed to.
                        Nothing is waiting on them until you send something, which is why a new deal
                        is always your move.
                    </PreviewNote>
                </Preview>
            </FormShell>
        </AppPage>
    );
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
        </>
    ),
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
    tag: svg(
        <>
            <path d="M3.5 3.5h6l7 7-6 6-7-7v-6Z" />
            <circle cx="6.8" cy="6.8" r="1.1" />
        </>
    ),
    money: svg(
        <>
            <rect x="2.5" y="5.5" width="15" height="9" />
            <circle cx="10" cy="10" r="2" />
        </>
    ),
    note: svg(
        <>
            <path d="M4.5 3.5h11v13h-11z" />
            <path d="M7 7h6M7 10h6M7 13h3.5" />
        </>
    ),
};
