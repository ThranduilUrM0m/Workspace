// The ERP's navigation, the locked taxonomy (wireframes/shell/shell.js,
// HANDOFF §2): Workspace, Business, Content, then System on the floor.
// Sized to fit the rail with no internal scroll: an eleventh entry goes
// inside a sub, not on the end. Why each entry is or is not here
// (Inbox, Calendar, Archive, Quotes, Payments, Assets all cut on purpose)
// is written beside the wireframe's NAV.
//
// `section` is the role section that gates it (server access/abilities.ts);
// the shell hides what the caller cannot view once T6.6 reads /me.

export type Icon = 'grid' | 'bars' | 'folder' | 'people' | 'funnel' | 'ledger' | 'pulse' | 'pencil' | 'globe' | 'gear' | 'exit';

export interface NavLink {
    label: string;
    href: string;
    icon?: Icon;
    section?: string;
}
export interface NavParent {
    label: string;
    icon: Icon;
    section?: string;
    sub: NavLink[];
}
export type NavItem = { group: string } | NavLink | NavParent;

export const NAV: NavItem[] = [
    { group: 'Workspace' },
    { label: 'Dashboard', href: '/app', icon: 'grid' },
    { label: 'Work', href: '/app/work', icon: 'bars', section: 'projects' },
    { label: 'Projects', href: '/app/projects', icon: 'folder', section: 'projects' },
    { label: 'Clients', href: '/app/clients', icon: 'people', section: 'clients' },
    { group: 'Business' },
    {
        label: 'Deals',
        icon: 'funnel',
        section: 'deals',
        sub: [
            { label: 'Leads', href: '/app/deals/leads' },
            { label: 'Proposals', href: '/app/deals/proposals' },
            { label: 'Contracts', href: '/app/deals/contracts' },
        ],
    },
    {
        label: 'Finance',
        icon: 'ledger',
        section: 'finance',
        sub: [
            { label: 'Invoices', href: '/app/finance/invoices' },
            { label: 'Expenses', href: '/app/finance/expenses' },
            { label: 'Period', href: '/app/finance/period' },
        ],
    },
    { label: 'Analytics', href: '/app/analytics', icon: 'pulse', section: 'analytics' },
    { group: 'Content' },
    { label: 'Blog', href: '/app/blog', icon: 'pencil', section: 'content' },
    { label: 'Pages', href: '/app/pages', icon: 'globe', section: 'content' },
];

export const FOOT: NavItem[] = [
    { group: 'System' },
    {
        label: 'Settings',
        icon: 'gear',
        section: 'settings',
        sub: [
            { label: 'Business', href: '/app/settings/business' },
            { label: 'People', href: '/app/settings/people' },
            { label: 'Automations', href: '/app/settings/automations' },
            { label: 'Preferences', href: '/app/settings/preferences' },
            { label: 'Activity', href: '/app/settings/activity' },
        ],
    },
];

/** The link a path belongs to: the longest href that is the path or its parent. */
export function activeHref(pathname: string, items: NavItem[] = [...NAV, ...FOOT]): string | undefined {
    const hrefs = items.flatMap((i) => ('sub' in i ? i.sub.map((s) => s.href) : 'href' in i ? [i.href] : []));
    return hrefs
        .filter((h) => pathname === h || (h !== '/app' && pathname.startsWith(`${h}/`)))
        .sort((a, b) => b.length - a.length)[0];
}

/** Two letters, ink: "Zakariae Boutaleb" → "ZB", "zakariae" → "Z". */
export function initials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}
