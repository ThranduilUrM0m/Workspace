// The client record's tabs. A plain module, not a client one, because the
// page reads ?tab= on the server and the record renders in the browser:
// both import it (same reason as lib/projects/tabs.ts).
//
// Two, not four: Overview holds the whole relationship; Communication holds
// the one thing that does not fit inside it, a log read in full.

export const CLIENT_TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'log', label: 'Communication' },
] as const;
export type ClientTab = (typeof CLIENT_TABS)[number]['key'];

/** An unknown or missing tab is Overview, never a blank page. */
export const clientTabFrom = (raw: string | undefined): ClientTab =>
    CLIENT_TABS.find((t) => t.key === raw)?.key ?? 'overview';
