import { z } from 'zod';

// Projects (T7.1). One contract for the API and the ERP forms: the browser
// runs it as a courtesy, the server's run is the one that counts. Messages
// are codes, not sentences, as in enquiry.ts.
//
// Source of the shape: Blueprinting/wireframes/shell/projects-data.js
// (canonical sample records), projects-lib.js (STATUS), project-new.js
// (what create asks for), boutaleb.md "New/changed schema surface"
// (assetOwnership, governingLanguage).

/** Lifecycle. `idea` is a project from your own head, before any client. */
export const PROJECT_STATUSES = ['idea', 'intake_pending', 'planning', 'in_progress', 'review', 'on_hold', 'completed'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** The language client-facing generated prose is written in for this project. */
export const LANGUAGES = ['fr', 'en', 'ar'] as const;
export type Language = (typeof LANGUAGES)[number];

/** What the client's portal shows for this engagement. Default: all three. */
export const MODULES = ['quotes', 'invoices', 'payments'] as const;
export type Module = (typeof MODULES)[number];

export const CURRENCIES = ['MAD', 'EUR', 'USD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const ASSET_HOLDERS = ['client', 'studio'] as const;
export const ASSET_TRANSFERS = ['none', 'pending', 'done'] as const;

/** Lowercase letters, digits and single dashes, no dash at either end. */
export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "New lead — Atlas Spa" -> "new-lead-atlas-spa". Same rule as the create screen. */
export function slugify(s: string): string {
    return s
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
        .replace(/-+$/, '');
}

const text = (max: number) => z.string().trim().max(max, 'tooLong');
const objectId = z.string().regex(/^[a-f0-9]{24}$/, 'invalid');
const slug = z.string().trim().toLowerCase().max(80, 'tooLong').regex(SLUG, 'slug');

/** Who holds a domain, hosting account, analytics property… and whether it is moving to the client. */
export const assetOwnership = z.object({
    asset: text(60).min(1, 'required'),
    holder: z.enum(ASSET_HOLDERS),
    renews: z.iso.date('date').nullable().default(null),
    transfer: z.enum(ASSET_TRANSFERS).default('none'),
});
export type AssetOwnership = z.infer<typeof assetOwnership>;

/**
 * Create. Two things are required (project-new.js): a name, and the
 * language. The language is deliberately not defaulted. `clientId` null
 * means "my own idea": such a project starts at `idea`, every other one at
 * `intake_pending` (structure spec §8.02). Status is not asked.
 */
export const projectCreate = z.object({
    name: text(120).min(1, 'required'),
    governingLanguage: z.enum(LANGUAGES, 'required'),
    clientId: objectId.nullable(),
    /** Optional: derived from the name, bumped on collision, when absent. */
    slug: slug.optional(),
    /** What the lead already said. */
    note: text(2000).optional(),
    currency: z.enum(CURRENCIES).default('MAD'),
});
export type ProjectCreate = z.infer<typeof projectCreate>;

/** Update: any subset. A project with no client can only be an idea (checked server-side against the stored record). */
export const projectUpdate = z
    .object({
        name: text(120).min(1, 'required'),
        governingLanguage: z.enum(LANGUAGES),
        clientId: objectId.nullable(),
        slug,
        status: z.enum(PROJECT_STATUSES),
        note: text(2000),
        currency: z.enum(CURRENCIES),
        modules: z.array(z.enum(MODULES)).max(MODULES.length),
        assetOwnership: z.array(assetOwnership).max(30),
    })
    .partial()
    .refine((v) => Object.keys(v).length > 0, 'empty');
export type ProjectUpdate = z.infer<typeof projectUpdate>;

/** GET /projects filters. Completed and archived are hidden unless asked for. */
export const projectListQuery = z.object({
    status: z.enum(PROJECT_STATUSES).optional(),
    clientId: objectId.optional(),
    q: text(100).optional(),
    archived: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
});
export type ProjectListQuery = z.infer<typeof projectListQuery>;

/** Clients, as far as Projects needs them: pick one, or create one inline (project-new.js). */
export const CLIENT_STATUSES = ['lead', 'active', 'inactive'] as const;
export type ClientStatus = (typeof CLIENT_STATUSES)[number];

/** A client as a project carries it: enough to name it and link to it. */
export interface ClientSummary {
    id: string;
    name: string;
    company: string;
    /** The studio itself: projects for it read "Internal". */
    self: boolean;
}

/**
 * A project as every screen reads it (GET /projects, /projects/:id). Dates
 * are ISO strings; `renews` is a calendar day. `internal` is derived from
 * the client, never stored.
 */
export interface ProjectView {
    id: string;
    name: string;
    slug: string;
    status: ProjectStatus;
    client: ClientSummary | null;
    internal: boolean;
    governingLanguage: Language;
    note: string | null;
    currency: Currency;
    modules: Module[];
    assetOwnership: { asset: string; holder: (typeof ASSET_HOLDERS)[number]; renews: string | null; transfer: (typeof ASSET_TRANSFERS)[number] }[];
    archivedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export const clientCreate = z.object({
    name: text(120).min(1, 'required'),
    /** Defaults to the name: a person can be their own company. */
    company: text(120).optional(),
    email: z.string().trim().min(1, 'required').max(254, 'tooLong').pipe(z.email('email')).transform((e) => e.toLowerCase()),
    language: z.enum(LANGUAGES, 'required'),
    phone: text(40).optional(),
    website: text(200).optional(),
});
export type ClientCreate = z.infer<typeof clientCreate>;
