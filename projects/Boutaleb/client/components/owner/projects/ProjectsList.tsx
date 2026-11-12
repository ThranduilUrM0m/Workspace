'use client';

import type { MilestoneView, ProjectView } from '@repo/schemas';
import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import { Feed, FeedEvent, FeedNone, ListCols, ListEmpty, ListEnter, ListGroup, ListNoMatch, ListRow, ListStrip, Rail, RailSection, RowAction, Stat } from '@/components/owner/list/List';
import { AppPage } from '@/components/owner/shell/AppPage';
import { action, cash, clock, daysFrom, EMPTY_FACTS, group, matches, pipeline, position, STATUS, todayIso, type Clock, type Row } from '@/lib/projects/derive';
import { useOpenMilestones } from '@/lib/projects/milestones';
import { useProjects } from '@/lib/projects/queries';

// Projects, the command centre (wireframes/projects.html, shell/projects.js,
// spec 2026-09-04-01-projects-list.md). Who needs you now, and what shape
// the studio is in. Grouped by whose turn it is; order inside a group is
// meaningful, so there is no sort control. Completed is a folded fourth
// group, not an archive page.
//
// The project's own record arrives from the API, and every open milestone
// of every live project arrives in ONE second call (/milestones/open), not
// one plan request per row. The other facts that make a row urgent
// (contact log, money, tickets) belong to modules not built yet, so they
// stay EMPTY_FACTS and the cells say what is honestly known. When those
// land, only `factsFor` changes.

const NEW = '/app/projects/new';

function factsFor(open: MilestoneView[] | undefined) {
    const by = new Map<string, MilestoneView[]>();
    for (const m of open ?? []) by.set(m.projectId, [...(by.get(m.projectId) ?? []), m]);
    return (p: ProjectView) => ({ ...EMPTY_FACTS, milestones: by.get(p.id) ?? [] });
}

export function ProjectsList() {
    const [q, setQ] = useState('');
    const projects = useProjects();
    const open = useOpenMilestones();
    // Both requests fly together; the rows wait for both so no row first says
    // "No milestone set" and then changes its mind. A failed milestone call
    // does not blank the list: the rows say the dates are unavailable.
    const query = { ...projects, isPending: projects.isPending || open.isPending } as typeof projects;
    const newProject = (
        <Link className="btn-solid" href={NEW}>
            New project
        </Link>
    );
    return (
        <AppPage title="Projects" kicker="Who needs you now, and what shape the studio is in" search={{ placeholder: 'Filter projects…', value: q, onChange: setQ }}>
            <QueryGate
                query={query}
                kind="list"
                what="projects"
                className="b-list-wrap"
                action={newProject}
                isEmpty={(ps) => ps.length === 0}
                empty={
                    <>
                        <Strip rows={[]} today={todayIso()} action={newProject} />
                        <ListEmpty title="No projects yet" action={newProject}>
                            A project can start two ways: send a client an intake link, or start one from your own idea and attach a client later. Either way it lands here.
                        </ListEmpty>
                    </>
                }
            >
                {(ps) => <Ready projects={ps} milestones={open.isError ? null : open.data} q={q.trim()} action={newProject} />}
            </QueryGate>
        </AppPage>
    );
}

/** `milestones` null = the call failed: the dates are unknown, not absent. */
function Ready({ projects, milestones, q, action: primary }: { projects: ProjectView[]; milestones: MilestoneView[] | null | undefined; q: string; action: React.ReactNode }) {
    const today = todayIso();
    const [doneOpen, setDoneOpen] = useState(false);
    const known = milestones !== null;
    const rows = useMemo(() => {
        const f = factsFor(milestones ?? undefined);
        return projects.map((p) => ({ p, f: f(p) }));
    }, [projects, milestones]);
    const shown = rows.filter((r) => matches(r.p, q));
    const g = group(shown, today);

    return (
        <ListEnter>
            <Strip rows={rows} today={today} action={primary} />
            <Pipeline projects={projects} />
            <ListCols rail={<ProjectsRail rows={rows} today={today} known={known} />}>
                {shown.length === 0 ? (
                    <ListNoMatch q={q} />
                ) : (
                    <>
                        <ListGroup tone="mine" label="Your move" count={g.mine.length}>
                            {g.mine.map((r, i) => (
                                <ProjectRow key={r.p.id} row={r} today={today} n={i} known={known} />
                            ))}
                        </ListGroup>
                        <ListGroup tone="theirs" label="Waiting on them" count={g.theirs.length}>
                            {g.theirs.map((r, i) => (
                                <ProjectRow key={r.p.id} row={r} today={today} n={i} known={known} />
                            ))}
                        </ListGroup>
                        <ListGroup tone="parked" label="Parked" count={g.parked.length}>
                            {g.parked.map((r, i) => (
                                <ProjectRow key={r.p.id} row={r} today={today} n={i} known={known} />
                            ))}
                        </ListGroup>
                        {/* Gone entirely when there is no completed work: a heading that can only say zero is noise. */}
                        {g.done.length > 0 && (
                            <ListGroup tone="done" label="Completed" count={g.done.length} fold={{ open: doneOpen, onToggle: () => setDoneOpen(!doneOpen) }}>
                                {g.done.map((r, i) => (
                                    <ProjectRow key={r.p.id} row={r} today={today} n={i} known={known} />
                                ))}
                            </ListGroup>
                        )}
                    </>
                )}
            </ListCols>
        </ListEnter>
    );
}

/** Owed (with its late slice), the next due milestone, active value, paid this month. */
function Strip({ rows, today, action: primary }: { rows: Row[]; today: string; action: React.ReactNode }) {
    const s = position(rows, today);
    return (
        <ListStrip
            action={primary}
            stats={[
                <Stat
                    key="owed"
                    label="Owed"
                    value={s.owed ? cash(s.owed) : '—'}
                    sub={s.late ? `${cash(s.late)} late` : s.owedCount ? `${s.owedCount} project${s.owedCount === 1 ? '' : 's'}` : 'nothing outstanding'}
                    subTone={s.late ? 'late' : undefined}
                />,
                <Stat
                    key="due"
                    label="Next due"
                    value={s.soonest?.name ?? '—'}
                    sub={s.soonest?.due.txt ?? 'nothing scheduled'}
                    subTone={s.soonest?.due.state === 'soon' ? 'soon' : undefined}
                />,
                <Stat key="active" label="Active value" value={s.active ? cash(s.active) : '—'} sub="on the books" />,
                // Payments are Finance's (M10); until then nothing has been received that this screen can know of.
                <Stat key="paid" label="Paid this month" value="—" sub="received" />,
            ]}
        />
    );
}

/**
 * One hue per stage, shared by the bar and its legend swatch. A readout,
 * not a filter. Every segment is labelled underneath, so the hue never
 * carries the fact alone.
 */
function Pipeline({ projects }: { projects: ProjectView[] }) {
    const stages = pipeline(projects);
    if (!stages.length) return null;
    return (
        <div className="pr-pipe">
            <div className="pr-pipe-bar" aria-hidden="true">
                {stages.map((s, i) => (
                    <span key={s.status} className={`pr-pipe-seg pr-seg--${STATUS[s.status].short}`} style={{ flex: s.n, '--i': i } as CSSProperties} />
                ))}
            </div>
            <p className="pr-legend">
                {stages.map((s) => (
                    <span key={s.status}>
                        <i className={`pr-seg--${STATUS[s.status].short}`} aria-hidden="true" />
                        <b>{s.n}</b>
                        {STATUS[s.status].short}
                    </span>
                ))}
            </p>
        </div>
    );
}

function ProjectRow({ row: { p, f }, today, n, known }: { row: Row; today: string; n: number; known: boolean }) {
    const c = clock(p, f, today);
    const act = action(p, f, today);
    const parked = c.kind === 'none' && !act;
    const late = c.kind === 'late';
    const m = f.money;
    return (
        <ListRow
            n={n}
            name={p.name}
            href={`/app/projects/${p.id}`}
            meta={
                <>
                    <ClientCell p={p} />
                    <span className="b-list-dot" aria-hidden="true">
                        ·
                    </span>
                    <span className="b-list-status">{STATUS[p.status].label}</span>
                </>
            }
            clock={<ClockCell c={!known && c.kind === 'quiet' && c.text === 'No milestone set' ? { kind: 'quiet', text: 'Dates unavailable' } : c} />}
            // No source of truth, no display: zero tickets is an empty cell, not 0/0.
            work={!parked && f.tickets?.total ? `${f.tickets.done}/${f.tickets.total}` : null}
            money={
                !parked && m && (m.value || m.outstanding) ? (
                    <>
                        <span className="b-list-val">{cash(m.value, p.currency)}</span>
                        {m.outstanding > 0 && (
                            <span className={`b-list-owed${late ? ' is-late' : ''}`}>
                                {cash(m.outstanding, p.currency)} {late ? 'late' : 'owed'}
                            </span>
                        )}
                    </>
                ) : null
            }
            act={act && <RowAction {...act} />}
        />
    );
}

/**
 * Whose project this is. No client reads "Yours", not "No client yet": an
 * absence phrased as an absence reads as data someone forgot. The studio's
 * own projects read "Internal" and go nowhere; the studio does not brief
 * itself.
 */
function ClientCell({ p }: { p: ProjectView }) {
    if (!p.client) return <span className="pr-client pr-noclient">Yours</span>;
    if (p.internal) return <span className="pr-client pr-internal">Internal</span>;
    return (
        <Link className="pr-client" href={`/app/clients/${p.client.id}`}>
            {p.client.name}
        </Link>
    );
}

function ClockCell({ c }: { c: Clock }) {
    switch (c.kind) {
        case 'late':
            return <span className="b-list-late">Payment {c.days} days late</span>;
        case 'silent':
            return <span className="b-list-silent">Silent {c.days} days</span>;
        case 'quiet':
            return <span className="pr-quiet">{c.text}</span>;
        case 'milestone':
            return (
                <>
                    <span className="pr-ms">{c.name}</span>
                    {c.due ? <span className={`due${c.due.state ? ` ${c.due.state}` : ''}`}>{c.due.txt}</span> : <span className="pr-quiet">No date</span>}
                </>
            );
        case 'none':
            return null;
    }
}

const railDate = (iso: string) => new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

/** Next 14 days of milestones, then the contact log (M8). */
function ProjectsRail({ rows, today, known }: { rows: Row[]; today: string; known: boolean }) {
    const due = rows
        .flatMap((r) => r.f.milestones.filter((m) => !m.done && m.due && daysFrom(m.due, today) <= 14).map((m) => ({ m, p: r.p })))
        .sort((a, b) => a.m.due!.localeCompare(b.m.due!));
    return (
        <Rail>
            <RailSection title="Next 14 days">
                {due.length ? (
                    <Feed>
                        {due.map(({ m, p }, i) => {
                            const d = daysFrom(m.due!, today);
                            return <FeedEvent key={`${p.id}-${m.name}`} n={i} date={railDate(m.due!)} tone={d < 0 ? 'late' : d <= 7 ? 'soon' : undefined} title={m.name} sub={p.name} />;
                        })}
                    </Feed>
                ) : (
                    <FeedNone>{known ? 'Nothing due in the next two weeks.' : 'Milestones could not be loaded. Reload to try again.'}</FeedNone>
                )}
            </RailSection>
            <RailSection title="Recent activity">
                <FeedNone>No activity logged yet.</FeedNone>
            </RailSection>
        </Rail>
    );
}
