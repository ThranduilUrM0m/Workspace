'use client';

import type { DealSource, DealView } from '@repo/schemas';
import Link from 'next/link';
import { useState } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import {
    Feed,
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
    age,
    DOORS,
    EARNED,
    group,
    isOpen,
    matches,
    next,
    overdue,
    pipeline,
    SOURCE,
    STAGE,
    turn,
    wait,
    type Door,
} from '@/lib/deals/derive';
import { useDeals } from '@/lib/deals/queries';
import { cash, todayIso } from '@/lib/projects/derive';

// Deals (wireframes/deals.html, shell/deals.js): everything before a
// Project exists. ONE list with three doors: Leads, Proposals and Contracts
// are stages of one funnel, so the nav's three entries narrow this list and
// the screen says so. A list, not a board: a deal moves stage about four
// times in its life. Groups answer whose turn it is; closed deals fold.

const NEW = '/app/deals/new';

export function DealsList({ door }: { door?: Door }) {
    const [q, setQ] = useState('');
    const query = useDeals();
    const d = door ? DOORS[door] : null;
    const logIt = (
        <Link className="btn-solid" href={NEW}>
            Log an enquiry
        </Link>
    );
    return (
        <AppPage
            title={d?.title ?? 'Deals'}
            kicker={d?.kicker ?? 'Work you have not won yet'}
            search={{
                placeholder: `Filter ${(d?.title ?? 'deals').toLowerCase()}…`,
                value: q,
                onChange: setQ,
            }}
        >
            <QueryGate
                query={query}
                kind="list"
                what="deals"
                className="b-list-wrap dl-list"
                action={logIt}
                isEmpty={(ds) => ds.length === 0}
                empty={
                    <>
                        <Strip deals={[]} today={todayIso()} action={logIt} />
                        <ListEmpty title="No deals yet" action={logIt}>
                            A deal is everything before the work exists: an enquiry, what you
                            offered, and what they signed. One arrives on its own when somebody
                            fills in the site form, or you log a phone call here. It becomes a
                            project the day it is won.
                        </ListEmpty>
                    </>
                }
            >
                {(ds) => <Ready deals={ds} door={door} q={q.trim()} action={logIt} />}
            </QueryGate>
        </AppPage>
    );
}

function Ready({
    deals,
    door,
    q,
    action,
}: {
    deals: DealView[];
    door?: Door;
    q: string;
    action: React.ReactNode;
}) {
    const today = todayIso();
    const [closedOpen, setClosedOpen] = useState(false);
    const stage = door ? DOORS[door].stage : null;
    const shown = deals.filter((d) => (!stage || d.stage === stage) && matches(d, q));
    const g = group(shown, today);
    const won = g.closed.filter((d) => d.stage === 'won').length;

    return (
        <ListEnter>
            <Strip deals={deals} today={today} action={action} />
            {stage && (
                <div className="dl-scope">
                    <span>
                        Showing <b>{deals.filter((d) => d.stage === stage).length}</b>{' '}
                        {STAGE[stage].toLowerCase()} deal
                        {deals.filter((d) => d.stage === stage).length === 1 ? '' : 's'} of{' '}
                        {deals.length}.
                    </span>
                    <Link href="/app/deals">Show the whole funnel</Link>
                </div>
            )}
            <ListCols rail={<DealsRail deals={deals} today={today} />}>
                {shown.length === 0 ? (
                    q ? (
                        <ListNoMatch q={q} />
                    ) : (
                        <p className="b-list-nomatch" role="status">
                            No deals at this stage.
                        </p>
                    )
                ) : (
                    <>
                        <ListGroup tone="mine" label="Your move" count={g.mine.length}>
                            {g.mine.map((d, i) => (
                                <DealRow key={d.id} d={d} today={today} n={i} />
                            ))}
                        </ListGroup>
                        <ListGroup tone="theirs" label="Waiting on them" count={g.theirs.length}>
                            {g.theirs.map((d, i) => (
                                <DealRow key={d.id} d={d} today={today} n={i} />
                            ))}
                        </ListGroup>
                        {/* Won and lost together, folded: the losses are the half worth reading, under the wins they lost to. */}
                        {g.closed.length > 0 && (
                            <ListGroup
                                tone="parked"
                                label={`Closed · ${won} won`}
                                count={g.closed.length}
                                fold={{
                                    open: closedOpen,
                                    onToggle: () => setClosedOpen(!closedOpen),
                                }}
                            >
                                {g.closed.map((d, i) => (
                                    <DealRow key={d.id} d={d} today={today} n={i} />
                                ))}
                            </ListGroup>
                        )}
                    </>
                )}
            </ListCols>
        </ListEnter>
    );
}

/** Four facts between the rows: a count, a money total, a workload, a clock. Same shape as Projects and Clients. */
function Strip({
    deals,
    today,
    action,
}: {
    deals: DealView[];
    today: string;
    action: React.ReactNode;
}) {
    const p = pipeline(deals);
    const open = deals.filter(isOpen);
    const leads = open.filter((d) => d.stage === 'lead').length;
    const mine = open.filter((d) => turn(d, today) === 'mine').length;
    const late = open.filter((d) => overdue(d, today)).length;
    // The longest wait is the one number no row can show. Unsent deals are not waiting on anybody: excluded.
    const cold = open
        .filter((d) => wait(d, today) !== null)
        .sort((a, b) => wait(b, today)! - wait(a, today)!)[0];
    const guess = p.value - p.priced;
    return (
        <ListStrip
            action={action}
            stats={[
                <Stat
                    key="open"
                    label="Open deals"
                    value={p.count ? String(p.count) : '—'}
                    sub={p.count ? `${leads} not offered yet` : 'nothing in the funnel'}
                />,
                <Stat
                    key="pipe"
                    label="Pipeline"
                    value={p.value ? cash(p.value) : '—'}
                    sub={
                        !p.count
                            ? undefined
                            : p.unvalued
                              ? `${p.unvalued} with no number yet`
                              : guess
                                ? `${cash(guess)} still a guess`
                                : 'all priced'
                    }
                />,
                <Stat
                    key="mine"
                    label="Your move"
                    value={mine ? String(mine) : '—'}
                    sub={late ? `${late} gone quiet` : 'nothing overdue'}
                    subTone={late ? 'late' : undefined}
                />,
                <Stat
                    key="cold"
                    label="Longest wait"
                    value={cold?.client.name ?? '—'}
                    sub={cold ? `${wait(cold, today)} days` : 'nothing is out'}
                    subTone={cold && overdue(cold, today) ? 'late' : undefined}
                />,
            ]}
        />
    );
}

function Badge({ source }: { source: DealSource }) {
    return (
        <span className={`b-badge${EARNED.includes(source) ? ' b-badge--on' : ''}`}>
            {SOURCE[source].label}
        </span>
    );
}

function DealRow({ d, today, n }: { d: DealView; today: string; n: number }) {
    const verb = next(d, today);
    return (
        <ListRow
            n={n}
            name={d.title}
            href={`/app/deals/${d.id}`}
            meta={
                <>
                    {d.client.self ? (
                        <span className="dl-internal">Internal</span>
                    ) : (
                        <Link className="dl-client" href={`/app/clients/${d.client.id}`}>
                            {d.client.name}
                        </Link>
                    )}
                    <span className="b-list-dot" aria-hidden="true">
                        ·
                    </span>
                    <span className="b-list-status">{STAGE[d.stage]}</span>
                </>
            }
            clock={<Clock d={d} today={today} />}
            work={
                <span className="dl-src">
                    <Badge source={d.source} />
                </span>
            }
            money={
                d.value === null ? (
                    <span className="dl-est">no number yet</span>
                ) : (
                    <>
                        <span className="b-list-val">{cash(d.value)}</span>
                        {!d.priced ? (
                            <span className="dl-est">estimate</span>
                        ) : isOpen(d) ? (
                            <span className="dl-est">offered</span>
                        ) : null}
                    </>
                )
            }
            act={verb && <RowAction href={`/app/deals/${d.id}`} label={verb} chase />}
        />
    );
}

/** One clock per row, chosen by state. A closed deal shows its decision: the wait stopped mattering the day it ended. */
function Clock({ d, today }: { d: DealView; today: string }) {
    const w = wait(d, today);
    if (d.stage === 'won')
        return (
            <>
                <span className="dl-when">Won</span>
                <span className="dl-ago">{age(d, today)} days from first ask</span>
            </>
        );
    if (d.stage === 'lost')
        return (
            <>
                <span className="dl-when">Lost</span>
                <span className="dl-why">{d.lostWhy || 'no reason recorded'}</span>
            </>
        );
    if (w === null)
        return d.stage === 'lead' ? (
            <>
                <span className="dl-when">Asked</span>
                <span className="dl-ago">
                    {age(d, today) === 0 ? 'today' : `${age(d, today)} days ago`}
                </span>
            </>
        ) : (
            <>
                <span className="dl-when">Not sent yet</span>
                <span className="dl-ago">{age(d, today)} days open</span>
            </>
        );
    if (overdue(d, today)) return <span className="b-list-silent">Unanswered {w} days</span>;
    return (
        <>
            <span className="dl-when">Sent</span>
            <span className="dl-ago">
                {w === 0 ? 'today' : `${w} day${w === 1 ? '' : 's'} ago`}
            </span>
        </>
    );
}

/** What is out of your hands, longest first; then which channel actually produces work, by money. Not narrowed by the door. */
function DealsRail({ deals, today }: { deals: DealView[]; today: string }) {
    const out = deals
        .filter((d) => isOpen(d) && wait(d, today) !== null)
        .sort((a, b) => wait(b, today)! - wait(a, today)!);
    const won = deals.filter((d) => d.stage === 'won');
    const by = new Map<DealSource, { n: number; v: number }>();
    for (const d of won) {
        const s = by.get(d.source) ?? { n: 0, v: 0 };
        by.set(d.source, { n: s.n + 1, v: s.v + (d.value ?? 0) });
    }
    return (
        <Rail>
            <RailSection title="Out and unanswered">
                {out.length ? (
                    <Feed>
                        {out.map((d, i) => (
                            <FeedEvent
                                key={d.id}
                                n={i}
                                date={`${wait(d, today)}d`}
                                tone={overdue(d, today) ? 'late' : undefined}
                                title={d.title}
                                sub={d.client.name}
                            />
                        ))}
                    </Feed>
                ) : (
                    <FeedNone>Nothing is out for a reply.</FeedNone>
                )}
            </RailSection>
            <RailSection title="Where the wins came from">
                {by.size ? (
                    [...by.entries()]
                        .sort((a, b) => b[1].v - a[1].v)
                        .map(([s, g]) => (
                            <div className="dl-srcrow" key={s}>
                                <span className="dl-srcn">
                                    <Badge source={s} />
                                    <span className="b-list-dot" aria-hidden="true">
                                        ·
                                    </span>
                                    {g.n} won
                                </span>
                                <span className="dl-srcv">{cash(g.v)}</span>
                            </div>
                        ))
                ) : (
                    <FeedNone>No wins recorded yet.</FeedNone>
                )}
            </RailSection>
        </Rail>
    );
}
