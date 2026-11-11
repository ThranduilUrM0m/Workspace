'use client';

import type { MilestoneView, ProjectView } from '@repo/schemas';
import Link from 'next/link';
import { useState } from 'react';
import { QueryGate } from '@/components/owner/data/QueryGate';
import { ApiError } from '@/lib/api';
import { useBrief } from '@/lib/projects/brief';
import { relDue, todayIso } from '@/lib/projects/derive';
import { useMilestoneAct, useMilestones } from '@/lib/projects/milestones';

// The Plan tab (wireframes/shell/project-plan.js, structure spec §8.05).
// Where an approved brief becomes work: what the project IS, as phases,
// in order. Not a second ticket board: tickets live on the Work board
// (M9) and show here as a count with a way in.
//
// The gate is real but partial: with no phases, an unapproved brief stops
// you; phases that exist are always shown, because hiding work to enforce
// an order of operations is how a screen starts lying. Inline editing,
// never a modal: you are changing one line of a list you order against.

export function PlanTab({ p }: { p: ProjectView }) {
    const query = useMilestones(p.id);
    return (
        <QueryGate query={query} kind="tab" what="plan" className="pp-wrap">
            {(rows) => <Plan p={p} rows={rows} />}
        </QueryGate>
    );
}

function Plan({ p, rows }: { p: ProjectView; rows: MilestoneView[] }) {
    const brief = useBrief(p.id).data;
    const approved = brief?.state === 'approved';
    const [edit, setEdit] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const rec = `/app/projects/${p.id}`;

    if (!rows.length && !approved) {
        return (
            <div className="pp-empty" role="status">
                <h2>No plan yet.</h2>
                <p>The brief needs approving first. What the phases are is a reading of what the client asked for, and there is nothing to read yet.</p>
                <Link className="pp-more" href={`${rec}?tab=intake`}>
                    Open the intake
                </Link>
            </div>
        );
    }

    const add = adding ? (
        <PhaseForm p={p} done={() => setAdding(false)} />
    ) : (
        <button
            type="button"
            className="pp-add"
            onClick={() => {
                setAdding(true);
                setEdit(null);
            }}
        >
            + Add a phase
        </button>
    );

    // Approved, and no phases: a decision, not a gap. Small projects genuinely run as one piece.
    if (!rows.length) {
        return (
            <>
                <div className="pp-empty" role="status">
                    <h2>This project runs as one piece.</h2>
                    <p>No phases, and that is a decision rather than a gap: not every project has an inside worth naming.</p>
                </div>
                <div className="pp-adds">{add}</div>
                <Commercials />
            </>
        );
    }

    const open = rows.filter((m) => !m.done).length;
    return (
        <>
            <div className="pp-head">
                <span className="pp-head-l">
                    {rows.length} phase{rows.length === 1 ? '' : 's'}, {open ? `${open} still open` : 'all done'}
                </span>
                <span className="pp-head-l">No tickets on the board yet</span>
                {!approved && <span className="pp-head-l pp-warn">The brief is not approved yet</span>}
            </div>
            <ol className="pp-list" aria-label="Phases, in order">
                {rows.map((m, i) =>
                    edit === m.id ? (
                        <PhaseForm key={m.id} p={p} m={m} done={() => setEdit(null)} />
                    ) : (
                        <Phase
                            key={m.id}
                            p={p}
                            m={m}
                            i={i}
                            last={i === rows.length - 1}
                            edit={() => {
                                setEdit(m.id);
                                setAdding(false);
                            }}
                        />
                    ),
                )}
            </ol>
            <div className="pp-adds">{add}</div>
            <Commercials />
        </>
    );
}

function Phase({ p, m, i, last, edit }: { p: ProjectView; m: MilestoneView; i: number; last: boolean; edit: () => void }) {
    const act = useMilestoneAct(p.id);
    const due = m.due ? relDue(m.due, todayIso()) : null;
    return (
        <li className={m.done ? 'pp-ph is-done' : 'pp-ph'}>
            <span className="pp-ord" aria-hidden="true">
                {i + 1}
            </span>
            <div className="pp-ph-b">
                <div className="pp-ph-top">
                    <span className="pp-ph-name">{m.name}</span>
                    {m.done ? <span className="pp-done-tag">Done</span> : due ? <span className={`due ${due.state}`}>{due.txt}</span> : <span className="pp-none">not dated</span>}
                </div>
                {/* No tickets counted is not 0%: no source of truth, no bar. */}
                <span className="pp-ph-t pp-none">Nothing broken out yet</span>
                <Failure error={act.error} />
            </div>
            <div className="pp-ph-a">
                <button type="button" className="pp-mini" disabled={i === 0 || act.isPending} aria-label={`Move ${m.name} earlier`} onClick={() => act.mutate({ kind: 'move', id: m.id, direction: 'up' })}>
                    ↑
                </button>
                <button type="button" className="pp-mini" disabled={last || act.isPending} aria-label={`Move ${m.name} later`} onClick={() => act.mutate({ kind: 'move', id: m.id, direction: 'down' })}>
                    ↓
                </button>
                <button type="button" className="pp-mini pp-mini--w" disabled={act.isPending} onClick={() => act.mutate({ kind: 'done', id: m.id, done: !m.done })}>
                    {m.done ? 'Reopen' : 'Mark done'}
                </button>
                <button type="button" className="pp-mini pp-mini--w" onClick={edit} aria-label={`Edit ${m.name}`}>
                    Edit
                </button>
            </div>
        </li>
    );
}

/**
 * Adding or editing one phase. The edit row REPLACES the phase, so the list
 * never grows while you order it. Remove lives only in here: a destructive
 * control on a resting row is a mis-click waiting to happen.
 */
function PhaseForm({ p, m, done }: { p: ProjectView; m?: MilestoneView; done: () => void }) {
    const act = useMilestoneAct(p.id);
    const [name, setName] = useState(m?.name ?? '');
    const [due, setDue] = useState(m?.due ?? '');
    const key = m?.id ?? 'new';
    const save = () => {
        const body = { name: name.trim(), due: due || null };
        if (m) act.mutate({ kind: 'edit', id: m.id, ...body }, { onSuccess: done });
        else act.mutate({ kind: 'add', ...body }, { onSuccess: done });
    };
    const Row = m ? 'li' : 'div';
    return (
        <Row className="pp-ph pp-ph--edit">
            <span className="pp-ord" aria-hidden="true" />
            <form
                className="pp-ph-b"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (name.trim()) save();
                }}
                id={`pp-form-${key}`}
            >
                <div className="pp-edit">
                    <label className="pp-lbl">
                        Phase
                        <input className="pp-in" type="text" required maxLength={120} placeholder={m ? undefined : 'Build, Handover, Phase two…'} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                    </label>
                    <label className="pp-lbl">
                        Due
                        <input className="pp-in pp-in--date" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                    </label>
                </div>
                <p className="pp-hint">{m ? 'A phase without a date is a real phase: an order you have decided and a commitment you have not.' : 'It arrives with no tickets attached. You break the work out on the board, which is where tickets live.'}</p>
                <Failure error={act.error} />
            </form>
            <div className="pp-ph-a pp-ph-a--edit">
                <button type="submit" form={`pp-form-${key}`} className="btn-solid" disabled={!name.trim() || act.isPending}>
                    {m ? 'Save' : 'Add phase'}
                </button>
                <button type="button" className="pp-ghost" onClick={done}>
                    Cancel
                </button>
                {m && (
                    <button type="button" className="pp-ghost pp-ghost--bad" disabled={act.isPending} onClick={() => act.mutate({ kind: 'remove', id: m.id }, { onSuccess: done })}>
                        Remove
                    </button>
                )}
            </div>
        </Row>
    );
}

/**
 * Exactly two named numbers, borrowed from Finance (structure spec §3.1).
 * The schedule behind them is Finance's screen: a plan with its own copy
 * of a payment schedule would be a second place for it to be wrong.
 * Quotes arrive with M10; until then the section says so.
 */
function Commercials() {
    return (
        <section className="pp-money" aria-labelledby="pp-money-h">
            <h3 className="pp-sec-h" id="pp-money-h">
                Commercials
            </h3>
            <p className="pp-none">No accepted quote yet, so the plan has no money against it.</p>
            <Link className="pp-more" href="/app/finance/invoices">
                Open in Finance
            </Link>
        </section>
    );
}

function Failure({ error }: { error: Error | null }) {
    if (!error) return null;
    const gate = error instanceof ApiError && error.status === 409;
    return (
        <p className="pp-fail" role="alert">
            {gate ? 'The brief is not approved, so the first phase cannot be added yet.' : 'Did not save. Try again.'}
        </p>
    );
}
