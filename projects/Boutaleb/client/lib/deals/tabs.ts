// The deal record's tabs. A plain module, not a client one, because the
// page reads ?tab= on the server and the record renders in the browser:
// both import it (same reason as lib/projects/tabs.ts).

export const DEAL_TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'contract', label: 'Contract' },
] as const;
export type DealTab = (typeof DEAL_TABS)[number]['key'];

/** An unknown or missing tab is Overview, never a blank page. */
export const dealTabFrom = (raw: string | undefined): DealTab =>
    DEAL_TABS.find((t) => t.key === raw)?.key ?? 'overview';
