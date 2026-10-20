import { SetMetadata } from '@nestjs/common';
import type { Action, Section } from './abilities.js';

export const REQUIRES = 'requires';

export type Requirement =
    | { kind: 'ability'; action: Exclude<Action, 'manage'>; section: Section }
    | { kind: 'member' }
    | { kind: 'owner' };

// Every signed-in route states what it needs; one that states nothing is
// refused (access.guard.ts), so a forgotten decorator closes, never opens.

/** A level or a right on a section: @Requires('edit', 'projects'), @Requires('issueInvoices', 'finance'). */
export const Requires = (action: Exclude<Action, 'manage'>, section: Section) => SetMetadata(REQUIRES, { kind: 'ability', action, section } satisfies Requirement);

/** Any active member, whatever their role: /me, their own preferences. */
export const AnyMember = () => SetMetadata(REQUIRES, { kind: 'member' } satisfies Requirement);

/** The owner and nobody else, whatever a role grants: Settings › Activity. */
export const OwnerOnly = () => SetMetadata(REQUIRES, { kind: 'owner' } satisfies Requirement);
