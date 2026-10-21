import Link from 'next/link';

// REVIEW ONLY, not part of the design: flips the sample Dashboard between
// its states and between the two KPI rows so they can be judged side by
// side. Goes once the KPI pair is decided and the API answers.

const STATES = [
    ['ready', 'Ready'],
    ['empty', 'Empty'],
    ['loading', 'Loading'],
    ['error', 'Money failed'],
] as const;

export function ReviewBar({ state, kpis }: { state: string; kpis: string }) {
    const href = (s: string, k: string) => `/app?state=${s}&kpis=${k}`;
    return (
        <nav className="b-states" aria-label="Review switches">
            <b>Numbers</b>
            <Link href={href(state, 'current')} aria-pressed={kpis === 'current'} scroll={false}>
                Before
            </Link>
            <Link href={href(state, 'proposed')} aria-pressed={kpis === 'proposed'} scroll={false}>
                After
            </Link>
            <b>State</b>
            {STATES.map(([s, label]) => (
                <Link key={s} href={href(s, kpis)} aria-pressed={state === s} scroll={false}>
                    {label}
                </Link>
            ))}
        </nav>
    );
}
