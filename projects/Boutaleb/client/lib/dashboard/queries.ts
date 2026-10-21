import { EMPTY_MONEY, EMPTY_WORK, MONEY, WORK, type MoneyData, type WorkData } from './sample';

// The Dashboard reads two sources, each its own query, so one that fails
// blanks only its own widgets (HANDOFF §21: "one dead source must never
// blank the home screen").
//
// SAMPLE FETCHERS. They answer from sample.ts after a short wait, so the
// loading state is real. `review` reproduces the other states for review
// (?state=empty | loading | error); it goes when the API answers.

export type Review = 'ready' | 'empty' | 'loading' | 'error';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const dashboardKeys = {
    work: (r: Review) => ['dashboard', 'work', r] as const,
    money: (r: Review) => ['dashboard', 'money', r] as const,
};

export async function fetchWork(review: Review): Promise<WorkData> {
    if (review === 'loading') return new Promise(() => {});
    await wait(350);
    return review === 'empty' ? EMPTY_WORK : WORK;
}

export async function fetchMoney(review: Review): Promise<MoneyData> {
    if (review === 'loading') return new Promise(() => {});
    await wait(450);
    // The partial failure the wireframe draws: money does not arrive.
    if (review === 'error') throw new Error('money did not load');
    return review === 'empty' ? EMPTY_MONEY : MONEY;
}
