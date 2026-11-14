'use client';

import type { ClientRow } from '@repo/schemas';
import Link from 'next/link';
import { useState } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import {
    Feed,
    FeedActivity,
    FeedEvent,
    FeedNone,
    ListCols,
    ListEmpty,
    ListEnter,
    ListGroup,
    ListNoMatch,
    ListRow,
    ListStrip,
    Rail,
    RailSection,
    RowAction,
    Stat,
} from '@/components/owner/list/List';
import { AppPage } from '@/components/owner/shell/AppPage';
import {
    agoText,
    CLIENT_STATUS,
    DERIVED,
    drift,
    group,
    live,
    matches,
    silence,
    silent,
    standing,
    verb,
} from '@/lib/clients/derive';
import { useClients, useRecentContacts } from '@/lib/clients/queries';
import { ago, initials, todayIso } from '@/lib/projects/derive';

// Clients (wireframes/clients.html, shell/clients.js). Same three-group
// shape as Projects and Deals, but the groups are not the project turn
// summed up: having work to build is Tuesday. Needs you holds neglect only
// (a lead gone cold, a client you stopped talking to). Clients with no live
// work fold, they are not moved to an archive: a past client is the
// cheapest lead you will ever get.
//
// Money is Finance's (M10): Owed prints "—" and nothing is late until then.

const NEW = '/app/clients/new';

export function ClientsList() {
    const [q, setQ] = useState('');
    const query = useClients();
    const add = (
        <Link className="btn-solid" href={NEW}>
            New client
        </Link>
    );
    return (
        <AppPage
            title="Clients"
            kicker="The people the work is for"
            search={{ placeholder: 'Filter clients…', value: q, onChange: setQ }}
        >
            <QueryGate
                query={query}
                kind="list"
                what="clients"
                className="b-list-wrap cl-list"
                action={add}
                isEmpty={(cs) => cs.length === 0}
                empty={
                    <>
                        <Strip clients={[]} today={todayIso()} action={add} />
                        <ListEmpty title="No clients yet" action={add}>
                            A client arrives three ways: you add one here, one is created while
                            you start their first project or log an enquiry, or somebody fills
                            in the site form. Each way, they land in this list.
                        </ListEmpty>
                    </>
                }
            >
                {(cs) => <Ready clients={cs} q={q.trim()} action={add} />}
            </QueryGate>
        </AppPage>
    );
}

function Ready({ clients, q, action }: { clients: ClientRow[]; q: string; action: React.ReactNode }) {
    const today = todayIso();
    const [pastOpen, setPastOpen] = useState(false);
    const shown = clients.filter((c) => matches(c, q));
    const g = group(shown, today);
    return (
        <ListEnter>
            <Strip clients={clients} today={today} action={action} />
            <ListCols rail={<ClientsRail clients={clients} today={today} />}>
                {shown.length === 0 ? (
                    <ListNoMatch q={q} />
                ) : (
                    <>
                        <ListGroup tone="mine" label="Needs you" count={g.mine.length}>
                            {g.mine.map((c, i) => (
                                <Row key={c.id} c={c} today={today} n={i} />
                            ))}
                        </ListGroup>
                        <ListGroup tone="theirs" label="Running" count={g.ok.length}>
                            {g.ok.map((c, i) => (
                                <Row key={c.id} c={c} today={today} n={i} />
                            ))}
                        </ListGroup>
                        {g.none.length > 0 && (
                            <ListGroup
                                tone="parked"
                                label="No live work"
                                count={g.none.length}
                                fold={{ open: pastOpen, onToggle: () => setPastOpen(!pastOpen) }}
                            >
                                {g.none.map((c, i) => (
                                    <Row key={c.id} c={c} today={today} n={i} />
                                ))}
                            </ListGroup>
                        )}
                    </>
                )}
            </ListCols>
        </ListEnter>
    );
}

/** The four relationship-level facts no single row can show. */
function Strip({ clients, today, action }: { clients: ClientRow[]; today: string; action: React.ReactNode }) {
    const people = clients.filter((c) => !c.self);
    const liveN = people.filter((c) => standing(c) === 'live').length;
    const leads = people.filter((c) => standing(c) === 'lead').length;
    // The relationship going cold across everything you have with someone. Past clients count on purpose.
    const cold = people
        .filter((c) => silence(c, today) !== null)
        .sort((a, b) => silence(b, today)! - silence(a, today)!)[0];
    const coldDays = cold ? silence(cold, today)! : 0;
    return (
        <ListStrip
            action={action}
            stats={[
                <Stat
                    key="n"
                    label="Clients"
                    value={people.length ? String(people.length) : '—'}
                    sub={`${liveN} with live work`}
                />,
                <Stat key="owed" label="Owed" value="—" sub="invoices arrive with Finance" />,
                <Stat
                    key="leads"
                    label="Leads"
                    value={leads ? String(leads) : '—'}
                    sub={leads ? 'nothing signed yet' : 'none open'}
                />,
                <Stat
                    key="cold"
                    label="Longest quiet"
                    value={cold?.name ?? '—'}
                    sub={cold ? `${coldDays} days` : 'nobody to measure yet'}
                    subTone={coldDays >= 30 ? 'late' : undefined}
                />,
            ]}
        />
    );
}

function Row({ c, today, n }: { c: ClientRow; today: string; n: number }) {
    const s = standing(c);
    const q = silence(c, today);
    const all = c.projects.length;
    const liveN = live(c).length;
    const v = verb(c, today);
    return (
        <ListRow
            n={n}
            avatar={initials(c.name)}
            name={c.name}
            href={`/app/clients/${c.id}`}
            meta={
                <>
                    <span className="cl-co">{c.company}</span>
                    <span className="b-list-dot" aria-hidden="true">
                        ·
                    </span>
                    {c.self ? (
                        <span className="cl-internal">Internal</span>
                    ) : (
                        <>
                            <span className="b-list-status">{CLIENT_STATUS[c.status as keyof typeof CLIENT_STATUS] ?? c.status}</span>
                            {drift(c) && (
                                <>
                                    <span className="b-list-dot" aria-hidden="true">
                                        ·
                                    </span>
                                    <span className="cl-drift">{DERIVED[s]}</span>
                                </>
                            )}
                        </>
                    )}
                </>
            }
            clock={
                c.self ? null : q === null ? (
                    <span className="cl-quiet">Never contacted</span>
                ) : silent(c, today) && v ? (
                    <span className="b-list-silent">Silent {q} days</span>
                ) : (
                    <>
                        <span className="cl-spoke">{c.lastTheirs ? 'Last spoke' : 'No reply yet'}</span>
                        <span className="cl-ago">{agoText(q)}</span>
                    </>
                )
            }
            work={
                all ? (
                    liveN ? (
                        <>
                            <span className="cl-live">{liveN} live</span>
                            <span className="cl-of">of {all}</span>
                        </>
                    ) : (
                        <span className="cl-of">{all} done</span>
                    )
                ) : null
            }
            act={v && <RowAction href={v.href} label={v.label} chase />}
        />
    );
}

/** Leads by how cold they are; then the last things said, across everyone. */
function ClientsRail({ clients, today }: { clients: ClientRow[]; today: string }) {
    const leads = clients
        .filter((c) => !c.self && standing(c) === 'lead')
        .map((c) => ({ c, q: silence(c, today) }))
        .sort((a, b) => (b.q ?? 1e9) - (a.q ?? 1e9));
    return (
        <Rail>
            <RailSection title="Open leads">
                {leads.length ? (
                    <Feed>
                        {leads.map(({ c, q }, i) => (
                            <FeedEvent
                                key={c.id}
                                n={i}
                                date={q === null ? 'new' : `${q}d`}
                                tone={q === null || q >= 7 ? 'late' : undefined}
                                title={c.name}
                                sub={c.company}
                            />
                        ))}
                    </Feed>
                ) : (
                    <FeedNone>No open leads.</FeedNone>
                )}
            </RailSection>
            <RailSection title="Recent contact">
                <Recent today={today} />
            </RailSection>
        </Rail>
    );
}

/** The same log the record reads, across everyone, newest first. Its own request: a rail that fails says so alone. */
function Recent({ today }: { today: string }) {
    const r = useRecentContacts();
    if (r.isPending) return <FeedNone>Loading…</FeedNone>;
    if (r.isError) return <FeedNone>Could not load recent contact.</FeedNone>;
    if (!r.data.length) return <FeedNone>No contact logged yet.</FeedNone>;
    return (
        <Feed>
            {r.data.map((e, i) => (
                <FeedActivity
                    key={e.id}
                    n={i}
                    age={ago(e.at, today)}
                    kind={e.kind}
                    text={e.text}
                    sub={e.client.name}
                />
            ))}
        </Feed>
    );
}
