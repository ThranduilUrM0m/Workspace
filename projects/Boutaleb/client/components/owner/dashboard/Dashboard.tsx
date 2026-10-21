'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { dashboardKeys, fetchMoney, fetchWork, type Review } from '@/lib/dashboard/queries';
import { KPIS_CURRENT, KPIS_EMPTY, KPIS_PROPOSED, MAD, type Kpi, type MoneyData, type Prio, type WorkData } from '@/lib/dashboard/sample';
import { initials } from '@/components/owner/shell/nav';
import { atTime, Loading, OFFLINE, Skel } from '@/components/owner/data/states';

// The studio's home screen (wireframes/dashboard-v4.html + shell/dash-v4.js).
// Dashboard = now and action; Analytics = months and judgement.
//
// Two sources, two queries: when money fails, its KPIs read "Did not load"
// and Performance says so in place with Try again; the rest stays usable.
// Quick actions are not data and are drawn in every state.

const PRIO: Record<Prio, string> = { critical: '#C0392B', high: '#B8862F', medium: '#6B6B72', low: '#C7C7CC' };

const ICON: Record<string, ReactNode> = {
    folder: <path d="M2.5 5.5a1 1 0 0 1 1-1h4l1.5 2h7.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-10Z" />,
    ledger: (
        <>
            <path d="M5 2.5h10v15l-2-1.3-1.7 1.3-1.7-1.3L8 17.5l-1.7-1.3L5 17.5v-15Z" />
            <path d="M7.5 7h5M7.5 10h5M7.5 13h3" />
        </>
    ),
    clock: (
        <>
            <circle cx="10" cy="10" r="7.5" />
            <path d="M10 5.5V10l3 2" />
        </>
    ),
    coins: (
        <>
            <ellipse cx="10" cy="5.5" rx="6.5" ry="2.5" />
            <path d="M3.5 5.5v9c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-9" />
            <path d="M3.5 10c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5" />
        </>
    ),
    inbox: (
        <>
            <path d="M2.5 11.5h4l1.5 2.5h4l1.5-2.5h4" />
            <path d="M4.7 4h10.6l2.2 7.5v4a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-4L4.7 4Z" />
        </>
    ),
    hourglass: <path d="M5.5 2.5h9M5.5 17.5h9M6.5 2.5c0 4 3.5 5 3.5 7.5S6.5 13.5 6.5 17.5M13.5 2.5c0 4-3.5 5-3.5 7.5s3.5 3.5 3.5 7.5" />,
    people: (
        <>
            <circle cx="7" cy="6.5" r="2.5" />
            <path d="M2.5 16c0-3 2-4.8 4.5-4.8s4.5 1.8 4.5 4.8" />
            <circle cx="14.5" cy="7" r="2" />
            <path d="M13 11.5c2 0 4 1.5 4 4.5" />
        </>
    ),
    pulse: <path d="M2.5 11.5h3l2.5-6 3.5 10 2.5-7 1.5 3h2" />,
    calend: (
        <>
            <rect x="2.5" y="4.5" width="15" height="13" />
            <path d="M2.5 8.5h15M6.5 2.5v4M13.5 2.5v4" />
        </>
    ),
    bolt: <path d="M11 2.5 4.5 11h4.2l-1 6.5L16 9h-4.3l-.7-6.5Z" />,
    doc: (
        <>
            <path d="M5 2.5h6l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1Z" />
            <path d="M11 2.5v4h4M7 11h6M7 14h4" />
        </>
    ),
    plus: <path d="M10 4v12M4 10h12" />,
    up: <path d="M4 16 16 4M16 4H9M16 4v7" />,
    down: <path d="M4 4l12 12M16 16H9M16 16V9" />,
};
const Svg = ({ name, w = 1.6 }: { name: string; w?: number }) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={w} aria-hidden="true">
        {ICON[name]}
    </svg>
);
const Dots = () => (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <circle cx="10" cy="4.5" r="1.3" />
        <circle cx="10" cy="10" r="1.3" />
        <circle cx="10" cy="15.5" r="1.3" />
    </svg>
);

const ACTIONS = [
    { icon: 'doc', label: 'New quote', desc: 'From a client or a project', href: '/app/deals/new' },
    { icon: 'ledger', label: 'New invoice', desc: 'Bill work already done', href: '/app/finance/invoices/new' },
    { icon: 'plus', label: 'Add project', desc: 'Start a new engagement', href: '/app/projects/new' },
    { icon: 'people', label: 'Log a lead', desc: 'Someone who enquired', href: '/app/deals/leads/new' },
];

export function Dashboard({ review, kpiSet }: { review: Review; kpiSet: 'current' | 'proposed' }) {
    const work = useQuery({ queryKey: dashboardKeys.work(review), queryFn: () => fetchWork(review) });
    const money = useQuery({
        queryKey: dashboardKeys.money(review),
        queryFn: () => fetchMoney(review),
        // The review's failed state should show at once, not after three retries.
        retry: review === 'error' ? false : 3,
    });
    const dockAway = useDockAway();
    const loading = work.isPending && money.isPending;

    return (
        <div className="d-wrap" aria-busy={loading} data-dock-away={dockAway ? '' : undefined}>
            {loading && <Loading what="the dashboard" />}
            <Strip data={work.data} pending={work.isPending} />
            <Kpis set={kpiSet} work={work.data} money={money} empty={!!work.data && !work.data.projects.length} />
            <div className="d-row two">
                <Projects data={work.data} />
                <Performance money={money} />
            </div>
            <div className="d-row three">
                <Deadlines data={work.data} />
                <Clients data={work.data} />
                <QuickActions />
            </div>
        </div>
    );
}

/* ---------- Needs you ---------- */
function Strip({ data, pending }: { data?: WorkData; pending: boolean }) {
    if (pending || !data) {
        return (
            <div className="d-strip d-strip--sk" aria-hidden="true">
                <span className="d-strip-mark" />
                <span className="d-strip-lbl">Needs you</span>
                <div className="d-strip-items">
                    <span className="d-strip-item">
                        <Skel w="70%" h=".75rem" />
                    </span>
                </div>
            </div>
        );
    }
    if (!data.needs.length) {
        return (
            <div className="d-strip d-strip--clear">
                <span className="d-strip-lbl">Needs you</span>
                <div className="d-strip-items">
                    <span className="d-strip-item">Nothing needs you right now.</span>
                </div>
            </div>
        );
    }
    return (
        <div className="d-strip">
            <span className="d-strip-mark">
                <span className="d-strip-ring" />
                <span className="d-strip-dot" />
            </span>
            <span className="d-strip-lbl">Needs you</span>
            <div className="d-strip-items">
                {data.needs.map((n) => (
                    // Sample strings carry <b> emphasis; real ones arrive as structured parts.
                    <span key={n} className="d-strip-item" dangerouslySetInnerHTML={{ __html: n }} />
                ))}
            </div>
            <button type="button" className="d-strip-count">
                View all {data.needs.length}
            </button>
        </div>
    );
}

/* ---------- The four numbers ---------- */
function Kpis({ set, work, money, empty }: { set: 'current' | 'proposed'; work?: WorkData; money: { isPending: boolean; isError: boolean }; empty: boolean }) {
    const list = set === 'proposed' ? KPIS_PROPOSED : KPIS_CURRENT;
    return (
        <div className="d-kpis">
            {list.map((k) => {
                const pending = k.source === 'money' ? money.isPending : !work;
                const failed = k.source === 'money' && money.isError;
                const shown: Kpi = empty ? { ...k, ...KPIS_EMPTY[k.label], delta: undefined, sentiment: undefined, stack: undefined } : k;
                return (
                    <div key={k.label} className={k.money ? 'd-kpi money' : 'd-kpi'}>
                        <div className="d-kpi-head">
                            <span className="d-kpi-lbl">{k.label}</span>
                            <Svg name={k.icon} />
                        </div>
                        {pending ? (
                            <>
                                <div className="d-kpi-mid">
                                    <Skel w="60%" h="1.5rem" />
                                </div>
                                <div className="d-kpi-foot">
                                    <Skel w="70%" h=".625rem" />
                                </div>
                            </>
                        ) : failed ? (
                            <>
                                <div className="d-kpi-mid">
                                    <span className="d-kpi-val d-kpi-na">—</span>
                                </div>
                                <div className="d-kpi-foot">
                                    <span className="d-kpi-ctx">Did not load</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="d-kpi-mid">
                                    <span className="d-kpi-val">
                                        <CountUp text={shown.value} />
                                    </span>
                                    {shown.stack && <Stack items={shown.stack} />}
                                </div>
                                <div className="d-kpi-foot">
                                    {shown.delta && (
                                        <span className={`d-delta ${shown.sentiment ?? ''}`}>
                                            {shown.sentiment && <Svg name={shown.sentiment} w={1.8} />}
                                            {shown.delta}
                                        </span>
                                    )}
                                    <span className="d-kpi-ctx">{shown.context}</span>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/* Which ones, as circles: two on a phone plus "+N", all of them on a desktop. */
function Stack({ items }: { items: NonNullable<Kpi['stack']> }) {
    return (
        <span className="d-kpi-stack">
            {items.map((p) => (
                <span key={p.name} className={p.fam ? `fam-${p.fam}` : undefined} title={p.name}>
                    {initials(p.name)}
                </span>
            ))}
            {items.length > 3 && (
                <span className="more" title={items.slice(2).map((p) => p.name).join(', ')}>
                    +{items.length - 2}
                </span>
            )}
        </span>
    );
}

/* A leading number counts up from zero once, on load. The final text is
   the real text, so with motion off nothing is missing. */
function CountUp({ text }: { text: string }) {
    const m = /^[\d,]+/.exec(text);
    const end = m ? Number(m[0].replace(/,/g, '')) : 0;
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el || !end || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const t0 = performance.now();
        let raf = 0;
        const tick = (t: number) => {
            const k = Math.min(1, (t - t0) / 1100);
            el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US');
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [end]);
    if (!m) return <>{text}</>;
    return (
        <>
            <span ref={ref}>{m[0]}</span>
            {text.slice(m[0].length)}
        </>
    );
}

/* ---------- Widgets ---------- */
function Head({ icon, eyebrow, title, link }: { icon: string; eyebrow: string; title: string; link?: { label: string; href: string } }) {
    return (
        <div className="d-w-head">
            <div className="d-w-headings">
                <Svg name={icon} />
                <div>
                    <span className="d-w-eyebrow">{eyebrow}</span>
                    <h2 className="d-w-title">{title}</h2>
                </div>
            </div>
            {link && (
                <Link className="d-w-link" href={link.href}>
                    {link.label}
                </Link>
            )}
        </div>
    );
}

function None({ title, text, door }: { title: string; text: string; door?: { label: string; href: string } }) {
    return (
        <div className="d-none">
            <p className="d-none-t">{title}</p>
            <p className="d-none-s">{text}</p>
            {door && (
                <Link className="d-none-a" href={door.href}>
                    {door.label}
                </Link>
            )}
        </div>
    );
}

const skRows = (cls: string, cells: (i: number) => ReactNode) =>
    [0, 1, 2].map((i) => (
        <div key={i} className={`${cls} d-sep d-skrow`} aria-hidden="true">
            {cells(i)}
        </div>
    ));

function Projects({ data }: { data?: WorkData }) {
    return (
        <section className="d-w d-w-proj">
            <Head icon="folder" eyebrow="Live engagements" title="Projects in progress" link={{ label: 'Open all projects', href: '/app/projects' }} />
            <div className="d-plist">
                {!data
                    ? skRows('d-p', (i) => (
                          <>
                              <Skel w="1rem" h="1rem" />
                              <div className="d-p-info">
                                  <Skel w={['60%', '48%', '54%'][i]} h=".8125rem" />
                                  <Skel w="40%" />
                              </div>
                              <span className="d-p-stage">
                                  <Skel w="4rem" h="1.125rem" />
                              </span>
                              <div className="d-p-prog">
                                  <Skel h=".25rem" />
                              </div>
                              <span className="d-p-amt">
                                  <Skel w="5rem" h=".75rem" />
                              </span>
                          </>
                      ))
                    : !data.projects.length
                      ? <None title="No projects yet" text="Projects in progress show here with their stage and how far along they are." door={{ label: 'New project', href: '/app/projects/new' }} />
                      : data.projects.map((p) => (
                            <div key={p.name} className="d-p d-sep">
                                <Svg name="folder" />
                                <div className="d-p-info">
                                    <span className="d-p-name">{p.name}</span>
                                    <span className="d-p-desc">{p.desc}</span>
                                </div>
                                <span className="d-p-stage">
                                    <span className={`tag fam fam-${p.fam}`}>{p.stage}</span>
                                </span>
                                <div className="d-p-prog">
                                    <span className="d-p-track">
                                        <span className="d-p-fill" style={{ width: `${p.pct}%` }} />
                                    </span>
                                    <span className="d-p-pct">{p.pct}%</span>
                                </div>
                                <span className="d-p-amt">{MAD(p.amount)}</span>
                                <button type="button" className="d-p-more" aria-label={`More for ${p.name}`}>
                                    <Dots />
                                </button>
                            </div>
                        ))}
            </div>
        </section>
    );
}

/* The money's shape. Its own source: when it fails, it says so here, in
   place, and the rest of the page stays current. */
function Performance({ money }: { money: { data?: MoneyData; isPending: boolean; isError: boolean; isFetching: boolean; errorUpdatedAt: number; failureCount: number; refetch: () => void } }) {
    let body: ReactNode;
    if (money.isError) {
        body = (
            <div className="d-fail" role="alert">
                {OFFLINE}
                <p>
                    <b>Money did not load.</b> The rest of the page is current. Last tried at {atTime(money.errorUpdatedAt)}.
                </p>
                <button type="button" className="d-fail-btn" onClick={() => money.refetch()} disabled={money.isFetching}>
                    {money.isFetching ? 'Trying…' : 'Try again'}
                </button>
            </div>
        );
    } else if (money.isPending || !money.data) {
        body = (
            <div className="d-fin" aria-hidden="true">
                <div className="d-fin-figures">
                    <div className="d-fin-fig">
                        <span className="d-fin-lbl">Revenue, MTD</span>
                        <Skel w="6rem" h="1.25rem" />
                    </div>
                    <div className="d-fin-fig">
                        <span className="d-fin-lbl">Cash in hand</span>
                        <Skel w="6rem" h="1.25rem" />
                    </div>
                </div>
                <div className="d-chart d-chart--sk">
                    <Skel h="100%" />
                </div>
            </div>
        );
    } else {
        const m = money.data;
        body = (
            <div className="d-fin">
                <div className="d-fin-figures">
                    <div className="d-fin-fig">
                        <span className="d-fin-lbl">Revenue, MTD</span>
                        <span className="d-fin-num money">{MAD(m.revenueMtd)}</span>
                    </div>
                    <div className="d-fin-fig">
                        <span className="d-fin-lbl">Cash in hand</span>
                        <span className="d-fin-num">{MAD(m.cashInHand)}</span>
                    </div>
                </div>
                {m.series.length ? (
                    <>
                        <Sparkline series={m.series} />
                        <p className="d-fin-note">
                            A project is worth <b>{MAD(m.avgProject)}</b> on average and runs <b>{m.avgMonths} months</b>.
                        </p>
                    </>
                ) : (
                    <div className="d-chart d-chart--none">
                        <span>The line starts with the first payment received.</span>
                    </div>
                )}
            </div>
        );
    }
    return (
        <section className="d-w d-w-perf">
            <Head icon="pulse" eyebrow="How the studio is doing" title="Performance" link={{ label: 'Detailed report', href: '/app/analytics' }} />
            {body}
        </section>
    );
}

/* An area chart on a fixed viewBox, stretched by CSS. Terracotta: money. */
function Sparkline({ series }: { series: MoneyData['series'] }) {
    const w = 280;
    const h = 72;
    const max = Math.max(...series.map((s) => s.value)) * 1.1;
    const line = series.map((s, i) => `${((i * w) / (series.length - 1)).toFixed(1)},${(h - (s.value / max) * h).toFixed(1)}`).join(' ');
    return (
        <div className="d-chart">
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
                <polygon points={`0,${h} ${line} ${w},${h}`} fill="var(--color-accent-tint)" />
                <polyline points={line} pathLength={1} fill="none" stroke="var(--color-accent)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
            <div className="d-chart-x">
                {series.map((s) => (
                    <span key={s.month}>{s.month}</span>
                ))}
            </div>
        </div>
    );
}

const day = (iso: string) => new Date(`${iso}T12:00:00Z`);

function Deadlines({ data }: { data?: WorkData }) {
    return (
        <section className="d-w d-w-dl">
            <Head icon="calend" eyebrow="Key dates ahead" title="Deadlines" link={{ label: 'See calendar', href: '/app/work' }} />
            <div className="d-dllist">
                {!data
                    ? skRows('d-dl', (i) => (
                          <>
                              <div className="d-dl-date">
                                  <Skel w="1.75rem" h="1.75rem" />
                              </div>
                              <div className="d-dl-body">
                                  <Skel w={['70%', '58%', '64%'][i]} h=".8125rem" />
                                  <Skel w="40%" />
                              </div>
                              <Skel w="3.5rem" />
                          </>
                      ))
                    : !data.deadlines.length
                      ? <None title="No dates ahead" text="Deadlines from projects and invoices land here, the nearest first." />
                      : data.deadlines.map((d) => (
                            <div key={d.title} className={d.prio === 'critical' ? 'd-dl d-sep is-critical' : 'd-dl d-sep'}>
                                <div className="d-dl-date">
                                    <span className="d-dl-day">{String(day(d.date).getUTCDate()).padStart(2, '0')}</span>
                                    <span className="d-dl-mon">{day(d.date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })}</span>
                                </div>
                                <div className="d-dl-body">
                                    <div className="d-dl-title">
                                        <span className="d-prio" style={{ '--prio': PRIO[d.prio] } as React.CSSProperties} />
                                        <span>{d.title}</span>
                                    </div>
                                    <div className="d-dl-sub">{d.sub}</div>
                                </div>
                                <span className="d-dl-rel">{d.rel}</span>
                            </div>
                        ))}
            </div>
        </section>
    );
}

function Clients({ data }: { data?: WorkData }) {
    return (
        <section className="d-w d-w-cl">
            <Head icon="people" eyebrow="Most recent" title="Recent clients" link={{ label: 'See all clients', href: '/app/clients' }} />
            <div className="d-cllist">
                {!data
                    ? skRows('d-cl', (i) => (
                          <>
                              <span className="b-av b-av--md d-skav" />
                              <div className="d-cl-body">
                                  <Skel w={['55%', '62%', '48%'][i]} h=".8125rem" />
                                  <Skel w="40%" />
                              </div>
                              <Skel w="4.5rem" />
                          </>
                      ))
                    : !data.clients.length
                      ? <None title="No clients yet" text="Clients arrive with their first enquiry or project." door={{ label: 'Add a client', href: '/app/clients/new' }} />
                      : data.clients.map((c) => (
                            <div key={c.name} className="d-cl d-sep">
                                <span className="b-av b-av--md">{initials(c.name)}</span>
                                <div className="d-cl-body">
                                    <span className="d-cl-name">{c.name}</span>
                                    <span className="d-cl-sub">{c.sub}</span>
                                </div>
                                <span className="d-cl-since">{c.since}</span>
                            </div>
                        ))}
            </div>
        </section>
    );
}

/* Ink = act, paper = read. A dock in the thumb zone on a phone. */
function QuickActions() {
    return (
        <section className="d-w d-qa">
            <Head icon="bolt" eyebrow="Fast shortcuts" title="Quick actions" />
            <div className="d-qa-grid">
                {ACTIONS.map((a) => (
                    <Link key={a.label} className="d-qa-tile" href={a.href}>
                        <Svg name={a.icon} />
                        <span className="d-qa-label">{a.label}</span>
                        <span className="d-qa-desc">{a.desc}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/* The phone dock steps aside while you read down the page and comes back
   the moment you scroll up; an 8px dead zone keeps a trembling thumb from
   flickering it; near the bottom it always shows. Inert from 48rem. */
function useDockAway(): boolean {
    const [away, setAway] = useState(false);
    useEffect(() => {
        const wide = matchMedia('(min-width: 48rem)');
        let last = scrollY;
        const onScroll = () => {
            const y = scrollY;
            const dy = y - last;
            if (Math.abs(dy) < 8) return;
            const atEnd = innerHeight + y >= document.documentElement.scrollHeight - 80;
            setAway(!wide.matches && dy > 0 && y > 120 && !atEnd);
            last = y;
        };
        addEventListener('scroll', onScroll, { passive: true });
        return () => removeEventListener('scroll', onScroll);
    }, []);
    return away;
}
