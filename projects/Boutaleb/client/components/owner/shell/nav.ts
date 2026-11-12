// The ERP's navigation, the locked taxonomy (wireframes/shell/shell.js,
// HANDOFF §2): Workspace, Business, Content, then System on the floor.
// Sized to fit the rail with no internal scroll: an eleventh entry goes
// inside a sub, not on the end. Why each entry is or is not here
// (Inbox, Calendar, Archive, Quotes, Payments, Assets all cut on purpose)
// is written beside the wireframe's NAV.
//
// `section` is the role section that gates it (server access/abilities.ts);
// the shell hides what the caller cannot view, read from /me (visibleNav).
// An entry without a section is open to every member: the Dashboard, and
// Settings › Preferences, which is the member's own.

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
        // Gated per sub, not as a whole: Preferences belongs to every member.
        label: 'Settings',
        icon: 'gear',
        sub: [
            { label: 'Business', href: '/app/settings/business', section: 'settings' },
            { label: 'People', href: '/app/settings/people', section: 'settings' },
            { label: 'Automations', href: '/app/settings/automations', section: 'settings' },
            { label: 'Preferences', href: '/app/settings/preferences' },
            { label: 'Activity', href: '/app/settings/activity', section: 'settings' },
        ],
    },
];

/**
 * The nav as this caller may see it. `canView` answers for a section; an
 * entry without one always shows. A parent goes when it, or every one of
 * its subs, is out of reach; a group heading goes when nothing is left
 * under it, because a heading over nothing reads as a broken page.
 */
export function visibleNav(items: NavItem[], canView: (section: string) => boolean): NavItem[] {
    const ok = (section?: string) => !section || canView(section);
    const kept: NavItem[] = [];
    for (const item of items) {
        if ('group' in item) kept.push(item);
        else if ('sub' in item) {
            if (!ok(item.section)) continue;
            const sub = item.sub.filter((s) => ok(s.section));
            if (sub.length) kept.push({ ...item, sub });
        } else if (ok(item.section)) kept.push(item);
    }
    return kept.filter((item, i) => !('group' in item) || (kept[i + 1] !== undefined && !('group' in kept[i + 1]!)));
}

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
