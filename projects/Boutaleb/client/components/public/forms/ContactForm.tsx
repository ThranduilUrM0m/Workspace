'use client';

import { BUDGETS, CATEGORIES, CONTACT_STEPS, CONTACT_VIA, contactEnquiry, HONEYPOT, STAGES, TIMELINES, type ContactEnquiry } from '@repo/schemas';
import { Button, Field, Form, FormFail, Honeypot, SelectField, useSchemaForm, type ErrorWords, type FieldErrors } from '@repo/ui';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { business } from '@/lib/business';
import { useFormToken } from '@/lib/form-token';
import { glyph } from './glyphs';

// /contact (contact.html): one form in three steps beside a rail. Continue
// checks the step being left, Back never does; step 3 is reached only
// through "+ Add more detail". The answers are kept in sessionStorage as
// they are typed, so a reload or a failed send loses nothing but the
// files (README 45). Sends to POST /api/enquiries, which answers 303 to
// /thanks (public-forms.md §1).

type Field = keyof ContactEnquiry;
type Step = 1 | 2 | 3;

const DRAFT = 'bt_contact_draft';

const RAIL = [
    { eye: 'Step 1', title: 'Basics', blurb: 'Who you are, what kind of project — just enough to start the conversation.' },
    { eye: 'Step 2', title: 'Project', blurb: 'The core of it — what you need, a rough sense of budget and timeline.' },
    { eye: 'Step 3 · optional', title: 'Extra detail', blurb: 'The more you share here, the sharper the first draft of your project guide will be.' },
];

const label = <T extends string>(values: readonly T[], words: Record<T, string>) => values.map((v) => ({ value: v, label: words[v] }));
const OPTIONS = {
    category: label(CATEGORIES, { new: 'New project', refresh: 'Refresh / redesign', 'not-sure': 'Not sure yet' }),
    budget: label(BUDGETS, { 'under-2k': 'Under $2k', '2k-5k': '$2k–$5k', '5k-15k': '$5k–$15k', '15k-plus': '$15k+', 'not-sure': 'Not sure yet' }),
    timeline: label(TIMELINES, { asap: 'ASAP', months: 'Within a few months', flexible: 'Flexible / no rush' }),
    via: label(CONTACT_VIA, { email: 'Email', phone: 'Phone', call: 'Call' }),
    stage: label(STAGES, { idea: 'Just an idea', direction: 'Have some direction', ready: 'Ready to start' }),
};

const stepOf = (name: string): Step => (CONTACT_STEPS.findIndex((s) => (s as readonly string[]).includes(name)) + 1 || 1) as Step;

const size = (b: number) => (b < 1048576 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`);

export function ContactForm({ locale, errorWords }: { locale: string; errorWords: ErrorWords }) {
    const [at, setAt] = useState<Step>(1);
    const [files, setFiles] = useState<File[]>([]);
    const [drag, setDrag] = useState(false);
    const [status, setStatus] = useState<'idle' | 'sending' | 'failed'>('idle');
    const [restored, setRestored] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const token = useFormToken();
    const moved = useRef(false);
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    const form = useSchemaForm(contactEnquiry, {
        idempotencyKey,
        name: '',
        email: '',
        phone: '',
        category: 'new',
        company: '',
        site: '',
        message: '',
        budget: 'under-2k',
        timeline: 'asap',
        via: 'email',
        timezone: '',
        stage: 'idea',
        outcome: '',
        heard: '',
        refs: '',
    });

    // The draft: restored once, then written on every change. Arriving from
    // a footer send ("Add budget and timeline", ?lead=), the draft holds that
    // send's answers: the form opens on step 2, where budget and timeline are.
    useEffect(() => {
        const saved = sessionStorage.getItem(DRAFT);
        const lead = new URLSearchParams(location.search).get('lead') ?? undefined;
        if (saved) {
            try {
                const draft = JSON.parse(saved) as Partial<ContactEnquiry>;
                form.reset({ ...form.getValues(), ...draft, lead: lead ?? draft.lead });
                if (lead && draft.name && draft.email) setAt(2);
                else setRestored(true);
            } catch {
                sessionStorage.removeItem(DRAFT);
            }
        } else if (lead) {
            form.setValue('lead', lead);
        }
        const { unsubscribe } = form.watch((values) => sessionStorage.setItem(DRAFT, JSON.stringify(values)));
        return unsubscribe;
    }, [form]);

    // A new step: its first field takes the focus, and the form comes back
    // into view if the page had scrolled past its top.
    useEffect(() => {
        if (!moved.current) return;
        const step = formRef.current?.querySelector<HTMLFieldSetElement>(`fieldset[data-s="${at}"]`);
        step?.querySelector<HTMLElement>('input:not([tabindex="-1"]),textarea,select')?.focus({ preventScroll: true });
        if (formRef.current && formRef.current.getBoundingClientRect().top < 0) formRef.current.scrollIntoView({ block: 'start' });
    }, [at]);

    const go = async (n: Step) => {
        if (n > at && !(await form.trigger([...CONTACT_STEPS[at - 1]], { shouldFocus: true }))) return;
        moved.current = true;
        setAt(n);
    };

    // A send with something wrong opens the step that holds the first problem.
    const showFirst = (names: string[]) => {
        const first = CONTACT_STEPS.flat().find((f) => names.includes(f));
        if (!first) return;
        setAt(stepOf(first));
        requestAnimationFrame(() => form.setFocus(first as Field));
    };

    const onInvalid = (errors: FieldErrors<ContactEnquiry>) => showFirst(Object.keys(errors));

    const onSubmit = async (data: ContactEnquiry) => {
        if (status === 'sending') return;
        setStatus('sending');
        const body = new FormData();
        for (const [k, v] of Object.entries(data)) if (v !== undefined) body.set(k, String(v));
        body.set('source', 'contact');
        body.set('locale', locale);
        body.set(HONEYPOT, (formRef.current?.elements.namedItem(HONEYPOT) as HTMLInputElement | null)?.value ?? '');
        for (const f of files) body.append('files', f);
        try {
            const t = await token.take();
            if (!t) return setStatus('failed');
            body.set('t', t);
            const res = await fetch('/api/enquiries', { method: 'POST', body });
            if (res.ok && res.redirected) {
                sessionStorage.removeItem(DRAFT);
                window.location.assign(new URL(res.url).pathname);
                return;
            }
            if (res.status === 422) {
                const { errors } = (await res.json()) as { errors: Record<string, string> };
                // A form left open a day: a fresh token, and the failure state asks for one more press.
                if (errors.form) {
                    token.reset();
                    return setStatus('failed');
                }
                for (const [name, code] of Object.entries(errors)) form.setError(name as Field, { message: code });
                showFirst(Object.keys(errors));
                setStatus('idle');
                return;
            }
            setStatus('failed');
        } catch {
            setStatus('failed');
        }
    };

    // Copied now: a FileList is live, and the input is cleared right after.
    const addFiles = (list: FileList | null) => {
        const added = Array.from(list ?? []);
        setFiles((f) => [...f, ...added]);
    };

    const failed = status === 'failed' && (
        <FormFail>
            Not sent: the connection dropped. Your answers are still here, so try again, or write to <a href={`mailto:${business.email}`}>{business.email}</a>.
        </FormFail>
    );
    const consent = (
        <p className="consent">
            Used only to reply. <Link href="/privacy">Privacy policy</Link>.
        </p>
    );
    const send = (
        <Button variant="go" type="submit" className="push" loading={status === 'sending'} loadingLabel="Sending…">
            Submit {glyph.arrow}
        </Button>
    );

    return (
        <div className="c-layout">
            <ol className="rail" style={{ '--at': at } as React.CSSProperties}>
                {RAIL.map((r, i) => (
                    <li key={r.title} className={i + 1 < at ? 'r-step done' : i + 1 > at ? 'r-step upcoming' : 'r-step'} aria-current={i + 1 === at ? 'step' : undefined}>
                        <span className="r-eye">{r.eye}</span>
                        <h2 className="r-title">{r.title}</h2>
                        <p>{r.blurb}</p>
                    </li>
                ))}
            </ol>

            <div className="ff-card c-card" onFocusCapture={token.prime}>
                {restored && <p className="c-restored">Your earlier answers are back. Attached files are not kept: add them again in step 3.</p>}
                <Form ref={formRef} className="c-form" form={form} errorWords={errorWords} onSubmit={onSubmit} onInvalid={onInvalid}>
                    <Honeypot />

                    <fieldset className={at === 1 ? 'step in' : 'step'} data-s="1" hidden={at !== 1}>
                        <legend className="grp">About you</legend>
                        <div className="ff-pair">
                            <Field name="name" label="Full name" icon={glyph.person} autoComplete="name" required />
                            <Field name="email" type="email" label="Email" icon={glyph.mail} autoComplete="email" required />
                        </div>
                        <Field name="phone" type="tel" label="Phone (optional)" icon={glyph.phone} autoComplete="tel" />
                        <p className="grp">The project</p>
                        <SelectField name="category" label="Project category" icon={glyph.tag} options={OPTIONS.category} />
                        <div className="ff-pair">
                            <Field name="company" label="Company / brand (optional)" icon={glyph.briefcase} autoComplete="organization" />
                            <Field name="site" label="Website or social link (optional)" icon={glyph.globe} autoComplete="url" />
                        </div>
                        <div className="acts">
                            <Button variant="go" className="push" onClick={() => go(2)}>
                                Continue {glyph.arrow}
                            </Button>
                        </div>
                    </fieldset>

                    <fieldset className={at === 2 ? 'step in' : 'step'} data-s="2" hidden={at !== 2}>
                        <legend className="grp">What you need</legend>
                        <Field name="message" label="A line or two about what you need" icon={glyph.bubble} multiline required />
                        <div className="ff-pair">
                            <SelectField name="budget" label="Budget" icon={glyph.clock} options={OPTIONS.budget} />
                            <SelectField name="timeline" label="Timeline" icon={glyph.calendar} options={OPTIONS.timeline} />
                        </div>
                        <p className="grp">Logistics</p>
                        <div className="ff-pair">
                            <SelectField name="via" label="Preferred contact" icon={glyph.tag} options={OPTIONS.via} />
                            <Field name="timezone" label="Timezone / location" icon={glyph.pin} />
                        </div>
                        <SelectField name="stage" label="Project stage" icon={glyph.star} options={OPTIONS.stage} />
                        {consent}
                        {at === 2 && failed}
                        <div className="acts">
                            <Button variant="back" onClick={() => go(1)}>
                                Back
                            </Button>
                            <Button variant="back" onClick={() => go(3)}>
                                + Add more detail
                            </Button>
                            {send}
                        </div>
                    </fieldset>

                    <fieldset className={at === 3 ? 'step in' : 'step'} data-s="3" hidden={at !== 3}>
                        <legend className="grp">Extra detail</legend>
                        <Field name="outcome" label="Desired outcome" icon={glyph.spark} multiline />
                        <div className="ff-pair">
                            <Field name="heard" label="How did you find this site" icon={glyph.plus} />
                            <Field name="refs" label="Reference links" icon={glyph.link} />
                        </div>
                        <label
                            className={drag ? 'dz drag' : 'dz'}
                            onDragEnter={(e) => (e.preventDefault(), setDrag(true))}
                            onDragOver={(e) => (e.preventDefault(), setDrag(true))}
                            onDragLeave={() => setDrag(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDrag(false);
                                addFiles(e.dataTransfer.files);
                            }}
                        >
                            <span className="dz-ico" aria-hidden="true">
                                {glyph.upload}
                            </span>
                            <span>Drag files or click to browse</span>
                            <input
                                type="file"
                                multiple
                                onChange={(e) => {
                                    addFiles(e.target.files);
                                    e.target.value = '';
                                }}
                            />
                        </label>
                        <ul className="dz-list" aria-live="polite">
                            {files.map((f, i) => (
                                <li key={`${f.name}-${i}`}>
                                    <span className="n">{f.name}</span>
                                    <span className="s">{size(f.size)}</span>
                                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((all) => all.filter((_, j) => j !== i))}>
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {consent}
                        {at === 3 && failed}
                        <div className="acts">
                            <Button variant="back" onClick={() => go(2)}>
                                Back
                            </Button>
                            {send}
                        </div>
                    </fieldset>
                </Form>
            </div>
        </div>
    );
}
