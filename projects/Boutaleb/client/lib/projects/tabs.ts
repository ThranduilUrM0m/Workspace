// The project record's tabs. A plain module, not a client one, because the
// page reads ?tab= on the server and the record renders in the browser:
// both import it.

export const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'intake', label: 'Intake' },
    { key: 'plan', label: 'Plan' },
    { key: 'wireframes', label: 'Wireframes' },
] as const;
export type TabKey = (typeof TABS)[number]['key'];

/** An unknown or missing tab is Overview, never a blank page. */
export const tabFrom = (raw: string | undefined): TabKey => TABS.find((t) => t.key === raw)?.key ?? 'overview';
