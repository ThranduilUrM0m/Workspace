'use client';

import type { DealView } from '@repo/schemas';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import {
    RecNone,
    RecordCols,
    RecordHead,
    RecSection,
    RecStat,
    Sep,
    TabNav,
} from '@/components/owner/record/Record';
import { AppPage } from '@/components/owner/shell/AppPage';
import {
    age,
    days,
    DETAIL_LABELS,
    DETAIL_WORDS,
    EARNED,
    isOpen,
    kind,
    next,
    overdue,
    QUIET,
    SOURCE,
    STAGE,
    wait,
} from '@/lib/deals/derive';
import { useDeal, useDeals, useLoseDeal } from '@/lib/deals/queries';
import { DEAL_TABS, type DealTab } from '@/lib/deals/tabs';
import { ago, cash, todayIso } from '@/lib/projects/derive';

// One deal (wireframes/deal.html, shell/deal.js). The list answers "what do
// I do today"; this answers what you offered this person, and where it
// stopped. Three tabs, always present, never disabled: a lead's Proposal
// tab says nothing has been offered instead of disappearing. Nothing is
// derived here: lib/deals/derive is shared with the list, so a number never
// changes on click.
//
// Proposals and contracts are not built yet (they are AI-drafted and
// human-reviewed, a later milestone), so their tabs say so and offer no
// button that would lead nowhere.

export function DealRecord({ id, tab }: { id: string; tab: DealTab }) {
    const query = useDeal(id);
    return (
        <AppPage title="Deals" kicker="Work you have not won yet">
            <QueryGate
                query={query}
                kind="rec"
                what="deals"
                one="deal"
                back="/app/deals"
                tabs={DEAL_TABS.map((t) => t.label)}
                className="b-rec-wrap"
            >
                {(d) => <Ready d={d} tab={tab} />}
            </QueryGate>
        </AppPage>
    );
}

function Ready({ d, tab }: { d: DealView; tab: DealTab }) {
    const today = todayIso();
    return (
        <>
            <Head d={d} today={today} />
            <TabNav
                tabs={DEAL_TABS}
                active={tab}
                href={(k) =>
                    k === 'overview' ? `/app/deals/${d.id}` : `/app/deals/${d.id}?tab=${k}`
                }
                label="Deal sections"
            />
            <RecordCols
                main={
                    tab === 'overview' ? (
                        <Overview d={d} today={today} />
                    ) : tab === 'proposal' ? (
                        <Proposal d={d} />
                    ) : (
                        <Contract d={d} />
                    )
                }
                rail={
                    <>
                        <Next d={d} today={today} />
                        <ClientBlock d={d} />
                        {tab === 'overview' && <Source d={d} />}
                    </>
                }
            />
        </>
    );
}

function Badge({ d }: { d: DealView }) {
    return (
        <span className={`b-badge${EARNED.includes(d.source) ? ' b-badge--on' : ''}`}>
            {SOURCE[d.source].label}
        </span>
    );
}

/* ---------- header ---------- */

function Head({ d, today }: { d: DealView; today: string }) {
    const w = wait(d, today);
    const clock: [string, ReactNode] =
        d.stage === 'won'
            ? ['Decided', <span key="c">Won {d.decided}</span>]
            : d.stage === 'lost'
              ? ['Decided', <span key="c">Lost {d.decided}</span>]
              : w === null
                ? [
                      'Waiting on',
                      <span key="c">
                          {d.stage === 'lead'
                              ? 'You, nothing offered yet'
                              : 'You, drafted, not sent'}
                      </span>,
                  ]
                : overdue(d, today)
                  ? [
                        'Attention',
                        <span key="c" className="due late">
                            Unanswered {days(w)}
                        </span>,
                    ]
                  : ['Sent', <span key="c">{w === 0 ? 'today' : `${days(w)} ago`}</span>];
    const ageTxt = isOpen(d)
        ? `${days(age(d, today))} open`
        : `${days(age(d, today) - ago(d.decided!, today))} to close`;
    return (
        <RecordHead
            name={d.title}
            who={d.client.name}
            meta={
                <>
                    {d.client.self ? (
                        <span>Internal</span>
                    ) : (
                        <Link href={`/app/clients/${d.client.id}`}>{d.client.name}</Link>
                    )}
                    <Sep />
                    <Badge d={d} />
                    <Sep />
                    <span>{d.value === null ? 'no number yet' : kind(d)}</span>
                </>
            }
            stats={
                <>
                    <RecStat label="Value">
                        {d.value === null ? (
                            <RecNone>—</RecNone>
                        ) : (
                            <span className="money">{cash(d.value)}</span>
                        )}
                    </RecStat>
                    <RecStat label="Stage">{STAGE[d.stage]}</RecStat>
                    <RecStat label="Age">{ageTxt}</RecStat>
                    <RecStat label={clock[0]}>{clock[1]}</RecStat>
                </>
            }
        />
    );
}

/* ---------- overview ---------- */

function Overview({ d, today }: { d: DealView; today: string }) {
    return (
        <>
            <RecSection title="How it went" i={0}>
                <Events d={d} today={today} />
            </RecSection>
            {d.enquiry && (
                <RecSection title="What they wrote" note={`site form, ${d.enquiry.ref}`} i={1}>
                    <Enquiry e={d.enquiry} />
                </RecSection>
            )}
            {d.note && (
                <RecSection title="What they said" note="your first note" i={1}>
                    <p className="dr-why">{d.note}</p>
                </RecSection>
            )}
            <RecSection title="The offer" i={2}>
                <div className="dr-empty">
                    <p>
                        Nothing has been offered yet. The proposal is drafted from the brief (the
                        phases, the price and the payment split) and you read it before it goes
                        anywhere. Proposals arrive in a later release.
                    </p>
                </div>
            </RecSection>
            {d.stage === 'lost' && (
                <RecSection title="Why it was lost" i={3}>
                    <p className="dr-why">
                        {d.lostWhy ||
                            'No reason was recorded, which is the only field on a dead deal worth reading again.'}
                    </p>
                </RecSection>
            )}
            <RecSection title="Their other deals" note="with this client" i={4}>
                <Others d={d} today={today} />
            </RecSection>
        </>
    );
}

/** Asked, offered, decided. A step that has not happened keeps its slot, so the gap is visible. */
function Events({ d, today }: { d: DealView; today: string }) {
    const step = (lbl: string, val: string, sub: string, pending: boolean, n: number) => (
        <div
            className={`dr-step${pending ? ' is-pending' : ''}`}
            style={{ '--n': n } as React.CSSProperties}
        >
            <span className="dr-slbl">{lbl}</span>
            <span className="dr-sval">{val}</span>
            <span className="dr-sago">{sub}</span>
        </div>
    );
    const w = wait(d, today);
    const sentSub = d.sent
        ? isOpen(d)
            ? `${days(w!)} ago`
            : `${days(ago(d.sent, today) - ago(d.decided!, today))} before the answer`
        : d.stage === 'lead'
          ? 'nothing offered yet'
          : 'drafted, still in your drawer';
    const a = age(d, today);
    return (
        <div className="dr-line">
            {step('Asked', d.opened, a === 0 ? 'today' : `${days(a)} ago`, false, 0)}
            {step('Sent', d.sent ?? 'Not sent', sentSub, !d.sent, 1)}
            {isOpen(d)
                ? step('Decided', 'Not yet', d.sent ? 'with them' : 'with you', true, 2)
                : step('Decided', d.decided!, STAGE[d.stage], false, 2)}
        </div>
    );
}

/** The site form's words, as the visitor wrote them, and the answers it collected. Read-only: it is what they said. */
function Enquiry({ e }: { e: NonNullable<DealView['enquiry']> }) {
    const rows = Object.entries(e.details).filter(([k]) => DETAIL_LABELS[k]);
    return (
        <>
            <p className="dr-why dr-said">{e.message}</p>
            {rows.length > 0 && (
                <div className="dr-meta">
                    {rows.map(([k, v]) => (
                        <div className="dr-mline" key={k}>
                            <span className="dr-mlbl">{DETAIL_LABELS[k]}</span>
                            <span className="dr-mval">{DETAIL_WORDS[k]?.[v] ?? v}</span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

function Others({ d, today }: { d: DealView; today: string }) {
    const all = useDeals();
    if (all.isPending) return <p className="dr-none-block">Looking…</p>;
    const rows = (all.data ?? [])
        .filter((x) => x.client.id === d.client.id && x.id !== d.id)
        .sort((a, b) =>
            isOpen(a) === isOpen(b) ? age(a, today) - age(b, today) : isOpen(a) ? -1 : 1
        );
    if (!rows.length)
        return (
            <p className="dr-none-block">This is the only deal on record with {d.client.name}.</p>
        );
    return (
        <div className="dr-other">
            {rows.map((x) => (
                <Link
                    key={x.id}
                    className={`dr-orow${isOpen(x) ? '' : ' is-closed'}`}
                    href={`/app/deals/${x.id}`}
                >
                    <span className="dr-oname">{x.title}</span>
                    <span className="dr-ostat">{STAGE[x.stage]}</span>
                    <span className="dr-oval money">{x.value === null ? '—' : cash(x.value)}</span>
                </Link>
            ))}
        </div>
    );
}

/* ---------- document tabs ---------- */

function Proposal({ d }: { d: DealView }) {
    return (
        <RecSection title="The offer">
            <div className="dr-empty">
                <p>
                    {isOpen(d)
                        ? 'No proposal yet. It is drafted from the brief (phases, price and payment split) and it does not leave here until you have read it.'
                        : 'No proposal was recorded for this deal.'}
                </p>
                <p className="dr-sub">Drafting proposals arrives in a later release.</p>
            </div>
        </RecSection>
    );
}

function Contract({ d }: { d: DealView }) {
    return (
        <RecSection title="The contract">
            <div className="dr-empty">
                <p>
                    {d.stage === 'lead'
                        ? 'There is nothing to contract yet: nothing has even been offered.'
                        : 'A contract follows an accepted proposal. This one has not come back yet.'}
                </p>
            </div>
        </RecSection>
    );
}

/* ---------- rail ---------- */

/**
 * ONE verb, and only where there is one; a sentence otherwise. The verbs
 * that need a proposal (draft, send, chase) are words until proposals
 * exist, never a button that leads nowhere. Close as lost is real now: an
 * enquiry from the site can be junk, and a deal nobody can close sits in
 * Your move forever.
 */
function Next({ d, today }: { d: DealView; today: string }) {
    const verb = next(d, today);
    const w = wait(d, today);
    const why = !isOpen(d)
        ? `This deal is closed. ${d.stage === 'won' ? 'The work is the board’s now.' : 'Nothing further is owed by either side.'}`
        : !verb
          ? `Nothing is owed by you. ${d.client.name} has the ${d.stage} and it has been quiet ${days(w!)}, inside the ${days(QUIET[d.stage]!)} you allow this stage.`
          : verb === 'Draft proposal'
            ? 'Nothing has been offered yet, so nobody is waiting on them. Next: draft the proposal.'
            : verb.startsWith('Send')
              ? `It is written and it has not left your drawer. Next: ${verb.toLowerCase()}.`
              : `It has been quiet ${days(w!)}, past the ${days(QUIET[d.stage]!)} this stage allows. Next: ${verb.toLowerCase()}.`;
    return (
        <section className="dr-next-sec" aria-label="Next">
            <h2 className="b-sec-h">Next</h2>
            <div className="dr-next">
                <p>{why}</p>
                {isOpen(d) && <Lose d={d} />}
            </div>
        </section>
    );
}

function Lose({ d }: { d: DealView }) {
    const [open, setOpen] = useState(false);
    const [why, setWhy] = useState('');
    const lose = useLoseDeal(d.id);
    if (!open)
        return (
            <button type="button" className="dr-lose-open" onClick={() => setOpen(true)}>
                Close as lost
            </button>
        );
    return (
        <form
            className="dr-lose"
            onSubmit={(e) => {
                e.preventDefault();
                if (why.trim()) lose.mutate(why.trim());
            }}
        >
            <label htmlFor="dr-lose-why">Why it was lost</label>
            <input
                id="dr-lose-why"
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                maxLength={200}
                placeholder="Went with a cheaper quote · Not a real enquiry"
                autoFocus
                autoComplete="off"
            />
            {lose.isError && <p className="dr-lose-err">Not saved. Try again.</p>}
            <div className="dr-lose-acts">
                <button type="button" className="dr-lose-cancel" onClick={() => setOpen(false)}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-solid"
                    disabled={!why.trim() || lose.isPending}
                >
                    {lose.isPending ? 'Closing…' : 'Close as lost'}
                </button>
            </div>
        </form>
    );
}

/** A site enquiry's client is created in the visitor's site language: the first reply should be in it. */
const REPLY_IN: Record<string, string> = { fr: 'French', en: 'English', ar: 'Arabic' };

function ClientBlock({ d }: { d: DealView }) {
    const c = d.client;
    return (
        <section aria-label="Client">
            <h2 className="b-sec-h">Client</h2>
            <div className="dr-meta">
                <div className="dr-mline">
                    <span className="dr-mlbl">Name</span>
                    <span className="dr-mval">
                        <Link href={`/app/clients/${c.id}`}>{c.name}</Link>
                    </span>
                </div>
                <div className="dr-mline">
                    <span className="dr-mlbl">Company</span>
                    <span className="dr-mval">{c.company}</span>
                </div>
                <div className="dr-mline">
                    <span className="dr-mlbl">Email</span>
                    <span className="dr-mval">
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                    </span>
                </div>
                <div className="dr-mline">
                    <span className="dr-mlbl">Reply in</span>
                    <span className="dr-mval">{REPLY_IN[c.language] ?? c.language}</span>
                </div>
            </div>
        </section>
    );
}

/** The one fact a deal owns that exists nowhere else: which channel produced it. */
function Source({ d }: { d: DealView }) {
    return (
        <section aria-label="Where it came from">
            <h2 className="b-sec-h">Where it came from</h2>
            <div>
                <Badge d={d} />
                <p className="dr-note">
                    {EARNED.includes(d.source)
                        ? 'Work your existing relationships produced: the only kind of source you can deliberately make more of.'
                        : 'Weather. It arrived on its own, and no amount of effort reliably makes more of it.'}
                </p>
            </div>
        </section>
    );
}
