import { AbilityBuilder, createMongoAbility, type MongoAbility } from '@casl/ability';

// Who may do what (Settings spec items 6-7, HANDOFF §17). Clerk only says
// who is calling; these rules, built from the caller's role in Mongo, say
// what they may do. Every endpoint checks them: a hidden button is not
// security.

/** The sections a role grants a level on, one per nav entry. */
export const SECTIONS = ['projects', 'clients', 'deals', 'finance', 'analytics', 'content', 'settings'] as const;
export type Section = (typeof SECTIONS)[number];

export const LEVELS = ['none', 'view', 'edit'] as const;
export type Level = (typeof LEVELS)[number];

/**
 * The two rights a level cannot express: each sends something outside the
 * business that cannot be quietly taken back. Each needs Edit on its section.
 */
export const RIGHTS = {
    issueInvoices: 'finance',
    publishContent: 'content',
} as const satisfies Record<string, Section>;
export type Right = keyof typeof RIGHTS;

export type Action = 'view' | 'edit' | Right | 'manage';
export type Subject = Section | 'all';
export type AppAbility = MongoAbility<[Action, Subject]>;

export interface RoleGrant {
    owner?: boolean;
    levels: Partial<Record<Section, Level>>;
    rights: Partial<Record<Right, boolean>>;
}

export function abilityFor(role: RoleGrant): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);
    if (role.owner) {
        can('manage', 'all');
        return build();
    }
    for (const section of SECTIONS) {
        const level = role.levels[section] ?? 'none';
        if (level === 'view' || level === 'edit') can('view', section);
        if (level === 'edit') can('edit', section);
    }
    for (const [right, section] of Object.entries(RIGHTS) as [Right, Section][]) {
        if (role.rights[right] && role.levels[section] === 'edit') can(right, section);
    }
    return build();
}
