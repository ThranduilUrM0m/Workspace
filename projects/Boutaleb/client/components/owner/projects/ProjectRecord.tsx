'use client';

import type { AssetOwnership, BriefState, Language, ProjectView } from '@repo/schemas';
import { MODULES } from '@repo/schemas';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import { Feed, FeedActivity, FeedNone, RailSection } from '@/components/owner/list/List';
import { Chip, RecMore, RecNone, RecordCols, RecordHead, RecSection, RecStat, Sep, TabNav, Tag } from '@/components/owner/record/Record';
import { AppPage } from '@/components/owner/shell/AppPage';
import { ago, cash, daysFrom, EMPTY_FACTS, lateMoney, nextMilestone, recordClock, relDue, STATUS, todayIso, type ProjectFacts } from '@/lib/projects/derive';
import { useBrief } from '@/lib/projects/brief';
import { useProject } from '@/lib/projects/queries';
import { IntakeTab } from './IntakeTab';
import { TABS, type TabKey } from '@/lib/projects/tabs';

// One project, held whole (wireframes/project.html, shell/project.js, spec
// 2026-09-04-03-project-overview.md). The list answers "who needs me"; this
// answers the question you arrive with once you picked one: what state is
// it in, and what is the one thing blocking it.
//
// This file owns the record: header, tabs, and which tab shows. Each tab's
// body is its own component. Derivations come from lib/projects/derive, the
// same functions the list ranks by, so a number never changes on click.
//
// Facts owned by modules not built yet (log, milestones, money, tickets)
// arrive as EMPTY_FACTS, and every block says what is honestly known.

const factsFor = (_p: ProjectView): ProjectFacts => EMPTY_FACTS;
const LANG: Record<Language, string> = { fr: 'French', ar: 'Arabic', en: 'English' };

export function ProjectRecord({ id, tab }: { id: string; tab: TabKey }) {
    const query = useProject(id);
    return (
        <AppPage title="Projects" kicker="One project, held whole">
            <QueryGate query={query} kind="rec" what="projects" one="project" back="/app/projects" tabs={TABS.map((t) => t.label)} className="b-rec-wrap">
                {(p) => <Ready p={p} tab={tab} />}
            </QueryGate>
        </AppPage>
    );
}

function Ready({ p, tab }: { p: ProjectView; tab: TabKey }) {
    const today = todayIso();
    const f = factsFor(p);
    const entering = useEntrance();
    return (
        <div className={entering ? 'po-enter' : undefined}>
            <Head p={p} f={f} today={today} />
            <TabNav tabs={TABS} active={tab} href={(k) => (k === 'overview' ? `/app/projects/${p.id}` : `/app/projects/${p.id}?tab=${k}`)} label="Project sections" />
            {tab === 'overview' && <Overview p={p} f={f} today={today} />}
            {tab === 'intake' && <IntakeTab p={p} />}
            {tab === 'plan' && (
                <TabEmpty title="No plan yet">Milestones get set once the brief is approved. Each one becomes a phase of work, in order.</TabEmpty>
            )}
            {tab === 'wireframes' && (
                <TabEmpty title="No rounds sent yet">Each round sent to the client is kept here as it was sent, with what came back. Rounds start once the plan is drawn.</TabEmpty>
            )}
        </div>
    );
}

/** The entrance plays once per load; a re-render (a tab change) never replays it. */
function useEntrance() {
    const [on, setOn] = useState(true);
    useEffect(() => {
        const t = setTimeout(() => setOn(false), 2000);
        return () => clearTimeout(t);
    }, []);
    return on;
}

/* ---------- header ---------- */

function Head({ p, f, today }: { p: ProjectView; f: ProjectFacts; today: string }) {
    const c = recordClock(p, f, today);
    const m = f.money;
    // The studio's own record reads Internal and links nowhere: there is no client to open.
    const who = !p.client ? <span>Yours</span> : p.client.self ? <span>Internal</span> : <Link href={`/app/clients/${p.client.id}`}>{p.client.company}</Link>;
    return (
        <RecordHead
            name={p.name}
            meta={
                <>
                    {who}
                    <Sep />
                    <span>{STATUS[p.status].label}</span>
                </>
            }
            stats={
                <>
                    <RecStat label="Value">{m?.value ? cash(m.value, p.currency) : <RecNone>—</RecNone>}</RecStat>
                    <RecStat label="Outstanding">{m?.outstanding ? <span className="b-rec-owed">{cash(m.outstanding, p.currency)}</span> : <RecNone>—</RecNone>}</RecStat>
                    {/* No tickets says so; 0/0 would read as a broken query. */}
                    <RecStat label="Work">{f.tickets?.total ? <Link href={`/app/work?proj=${p.slug}`}>{`${f.tickets.done}/${f.tickets.total} tickets`}</Link> : <RecNone>None yet</RecNone>}</RecStat>
                    <RecStat label={c.label}>
                        {c.kind === 'late' && <span className="due late">Payment {c.days} days late</span>}
                        {c.kind === 'silent' && <span className="due late">Silent {c.days} days</span>}
                        {c.kind === 'none' && <RecNone>None set</RecNone>}
                        {c.kind === 'undated' && <RecNone>Not dated</RecNone>}
                        {c.kind === 'due' && <span className={`due ${c.due.state}`}>{c.due.txt}</span>}
                    </RecStat>
                </>
            }
        />
    );
}

/* ---------- overview ---------- */

function Overview({ p, f, today }: { p: ProjectView; f: ProjectFacts; today: string }) {
    const lower = [
        <MoneyBlock key="money" p={p} f={f} today={today} />,
        <Blocked key="blocked" f={f} />,
        <Assets key="assets" assets={p.assetOwnership} today={today} />,
        <Modules key="modules" p={p} />,
    ];
    return (
        <RecordCols
            main={
                <>
                    <Spine p={p} f={f} today={today} />
                    <div className="po-lower">{lower}</div>
                </>
            }
            rail={
                <>
                    <ClientCard p={p} />
                    <MagicLink p={p} />
                    <Activity f={f} today={today} />
                </>
            }
        />
    );
}

function Track({ mod, label, value, sub, pct, more, i }: { mod: string; label: string; value: ReactNode; sub: ReactNode; pct?: number; more?: { href: string; label: string }; i: number }) {
    return (
        <div className={`po-track po-track--${mod}`} style={{ '--i': i } as CSSProperties}>
            <span className="b-sec-h">{label}</span>
            <span className="po-big">{value}</span>
            <span className="po-sub">{sub}</span>
            {/* A bar is a claim about a fraction: no denominator, no bar. */}
            {pct !== undefined && (
                <div className="po-bar">
                    <i style={{ inlineSize: `${pct}%` }} />
                </div>
            )}
            {more && <RecMore href={more.href}>{more.label}</RecMore>}
        </div>
    );
}

const BRIEF_WORDS: Record<BriefState, [ReactNode, string]> = {
    none: [<RecNone key="n">Not started</RecNone>, 'no questions sent yet'],
    awaiting: ['Sent', 'waiting on the client'],
    submitted: ['Submitted', 'waiting on your review'],
    approved: ['Approved', 'the plan can be drawn'],
    sent_back: ['Sent back', 'you asked for a change'],
};

/** Define it, build it, what is due next. Each borrowed: Intake, the board, the Plan own them. */
function Spine({ p, f, today }: { p: ProjectView; f: ProjectFacts; today: string }) {
    const rec = `/app/projects/${p.id}`;
    const t = f.tickets;
    const m = nextMilestone(f);
    const due = m?.due ? relDue(m.due, today) : null;
    // Borrowed from the Intake tab, which owns it: one word and a way in. No bar,
    // because one submission has no denominator. Until it loads, it reads as not started.
    const brief = BRIEF_WORDS[useBrief(p.id).data?.state ?? 'none'];
    return (
        <div className="po-spine">
            <Track mod="brief" label="Brief" value={brief[0]} sub={brief[1]} more={{ href: `${rec}?tab=intake`, label: 'Open intake' }} i={0} />
            {t?.total ? (
                <Track
                    mod="build"
                    label="Build"
                    value={
                        <>
                            {t.done}
                            <span className="po-of">/{t.total}</span>
                        </>
                    }
                    sub={`${Math.round((t.done / t.total) * 100)}% done`}
                    pct={Math.round((t.done / t.total) * 100)}
                    more={{ href: `/app/work?proj=${p.slug}`, label: 'Open on the board' }}
                    i={1}
                />
            ) : (
                <Track mod="build" label="Build" value={<RecNone>None</RecNone>} sub="no tickets on the board yet" i={1} />
            )}
            {m ? (
                <Track
                    mod={`next${due ? ` is-${due.state || 'far'}` : ''}`}
                    label="Next"
                    value={m.name}
                    sub={due ? <span className={`due ${due.state}`}>{due.txt}</span> : <RecNone>not dated</RecNone>}
                    more={{ href: `${rec}?tab=plan`, label: 'Open plan' }}
                    i={2}
                />
            ) : (
                <Track mod="next" label="Next" value={<RecNone>No plan</RecNone>} sub="milestones get set once the brief is approved" i={2} />
            )}
        </div>
    );
}

/**
 * Projected from Finance. Not a third definition of money: invoiced minus
 * paid IS the header's outstanding, shown rather than asserted. The bar
 * fills with what was paid, because a bar that grows with a debt reads as
 * progress.
 */
function MoneyBlock({ p, f, today }: { p: ProjectView; f: ProjectFacts; today: string }) {
    const note = 'How the outstanding number is made';
    // No counterparty, no invoice form: an action that cannot complete is worse than none.
    const billable = !!p.client && !p.internal;
    const issue = `/app/invoices/new?project=${p.id}`;
    const m = f.money;
    if (!m || !m.invoiced) {
        return (
            <RecSection title="Money" note={note} i={3}>
                <p className="po-empty">
                    Nothing invoiced yet.{m?.value ? ` The accepted quote is worth ${cash(m.value, p.currency)}.` : ''}
                </p>
                {billable && (
                    <div className="po-ways">
                        <RecMore href={issue}>Issue the first invoice</RecMore>
                    </div>
                )}
            </RecSection>
        );
    }
    const paid = m.invoiced - m.outstanding;
    const late = lateMoney(f, today);
    return (
        <RecSection title="Money" note={note} i={3}>
            <div className="po-nums">
                <span>
                    <b>{cash(m.invoiced, p.currency)}</b>invoiced
                </span>
                <span>
                    <b>{cash(paid, p.currency)}</b>paid
                </span>
                <span className={m.outstanding ? 'b-rec-owed' : undefined}>
                    <b>{cash(m.outstanding, p.currency)}</b>outstanding
                </span>
            </div>
            <div className="po-bar po-bar--paid">
                <i style={{ inlineSize: `${Math.round((paid / m.invoiced) * 100)}%` }} />
            </div>
            {late && m.dueOn && (
                <p className="po-modnote b-rec-owed">
                    Payment was due {longDate(m.dueOn)} — {late.days} days ago.
                </p>
            )}
            <div className="po-ways">
                {billable && <RecMore href={issue}>Issue an invoice</RecMore>}
                <RecMore href="/app/invoices">Open in Finance</RecMore>
            </div>
        </RecSection>
    );
}

/** Projected from the board, which owns tickets and what blocks them. */
function Blocked({ f }: { f: ProjectFacts }) {
    const open = f.tickets ? f.tickets.total - f.tickets.done : 0;
    return (
        <RecSection title="Blocked" i={4}>
            <p className="po-empty">
                Nothing blocked.{open ? ` ${open} ticket${open === 1 ? '' : 's'} still open.` : ''}
            </p>
        </RecSection>
    );
}

/**
 * Owned. The handover-liability register: who holds the domain, the
 * hosting, the analytics. Only the studio's own renewals warn: the same
 * date under the client's name is their bill, not a liability here.
 */
function Assets({ assets, today }: { assets: AssetOwnership[]; today: string }) {
    const note = 'Who holds what at handover';
    if (!assets.length) {
        return (
            <RecSection title="Asset ownership" note={note} i={5}>
                <p className="po-empty">Nothing recorded yet. Assets get listed as they are set up.</p>
            </RecSection>
        );
    }
    return (
        <RecSection title="Asset ownership" note={note} i={5}>
            <div>
                {assets.map((a) => {
                    const soon = !!a.renews && a.holder === 'studio' && daysFrom(a.renews, today) <= 30;
                    return (
                        <div className="po-asset" key={a.asset}>
                            <span className="po-name">{a.asset}</span>
                            <span className="po-holder">
                                {a.holder}
                                <span className={soon ? 'po-renew is-soon' : 'po-renew'}>{a.renews ? `renews ${longDate(a.renews)}` : 'no renewal'}</span>
                            </span>
                            <Tag tone={`po-tr--${a.transfer}`}>{a.transfer}</Tag>
                        </div>
                    );
                })}
            </div>
        </RecSection>
    );
}

/** Owned. What the client's project page shows: a per-engagement commercial call, not a Finance setting. */
function Modules({ p }: { p: ProjectView }) {
    // Records per module arrive with Finance; until then every enabled module counts zero, honestly.
    const count = (_m: string) => 0;
    const total = p.modules.reduce((n, m) => n + count(m), 0);
    return (
        <RecSection i={6} title="ERP modules" note={p.client && !p.client.self ? 'What this client sees on their project page' : 'What a client would see, once there is one'}>
            <div className="po-mods">
                {MODULES.map((m) => {
                    const on = p.modules.includes(m);
                    return (
                        <Chip key={m} on={on} n={on ? count(m) : undefined}>
                            {m}
                        </Chip>
                    );
                })}
            </div>
            <p className="po-modnote">{p.modules.length ? `${total} record${total === 1 ? '' : 's'} visible on the project page.` : 'Nothing enabled. The project page shows the brief and nothing else.'}</p>
        </RecSection>
    );
}

/* ---------- rail ---------- */

/** Borrowed from Clients. The language line is the one fact needed before writing. */
function ClientCard({ p }: { p: ProjectView }) {
    const c = p.client;
    return (
        <RailSection title="Client">
            {!c ? (
                <p className="po-empty">Yours. This started as your own idea; attach a client when there is one.</p>
            ) : c.self ? (
                <p className="po-empty">Internal work. Nobody to write to.</p>
            ) : (
                <>
                    <div className="po-client">
                        <span className="po-cname">{c.name}</span>
                        <span className="po-csub">{c.company}</span>
                        <a className="po-cmail" href={`mailto:${c.email}`}>
                            {c.email}
                        </a>
                        <span className="po-clang">Writes in {LANG[c.language]}</span>
                    </div>
                    <RecMore href={`/app/clients/${c.id}`}>Open client</RecMore>
                </>
            )}
        </RailSection>
    );
}

/**
 * Owned: one durable link per (client, project). It sits above the feed
 * because an expired link is the likeliest cause of a silent client, and
 * the explanation should be read before the symptom. Issuing arrives with
 * the link tokens (T8.4); until then the block states the fact and offers
 * no button that would do nothing.
 */
function MagicLink({ p }: { p: ProjectView }) {
    if (!p.client || p.client.self) return null;
    return (
        <RailSection title="Magic link">
            <p className="po-empty">No link issued yet.</p>
        </RailSection>
    );
}

/** Borrowed, read-only always: the log is appended by the system and owned by nobody. */
function Activity({ f, today }: { f: ProjectFacts; today: string }) {
    const rows = [...f.log].sort((a, b) => b.at.localeCompare(a.at));
    return (
        <RailSection title="Activity">
            {rows.length ? (
                <Feed>
                    {rows.map((l, i) => (
                        <FeedActivity key={`${l.at}-${i}`} age={ago(l.at, today)} kind={l.kind} text={l.text} n={i} />
                    ))}
                </Feed>
            ) : (
                <FeedNone>Nothing logged yet.</FeedNone>
            )}
        </RailSection>
    );
}

/** A tab whose subject has no record yet: says which state, and why. */
function TabEmpty({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="po-tab-empty" role="status">
            <h2>{title}</h2>
            <p className="po-empty">{children}</p>
        </div>
    );
}

const longDate = (iso: string) => new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
