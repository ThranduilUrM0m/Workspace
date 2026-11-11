import { z } from 'zod';

// Wireframe rounds (T7.5d; wireframes/shell/project-wireframes.js,
// structure spec §2 WireframeRound and §8.06). A ROUND IS A DECISION, not a
// file: what was sent, when, and what came back. The deliverable itself is a
// folder of static files; sending freezes it by copying, and that copy is
// the whole versioning story. History is append-only: a round is never
// edited or deleted once sent.

export const ROUND_STATES = ['draft', 'sent', 'changes', 'approved'] as const;
export type RoundState = (typeof ROUND_STATES)[number];

/** What a round folder may hold. Anything else is refused at upload, not discovered at review. */
export const BUNDLE_LIMITS = { files: 300, fileBytes: 15 * 1024 * 1024, totalBytes: 60 * 1024 * 1024 } as const;
export const BUNDLE_EXTENSIONS = [
    'html', 'htm', 'css', 'js', 'mjs', 'json', 'map', 'txt',
    'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'ico',
    'woff', 'woff2', 'ttf', 'otf', 'mp4', 'webm',
] as const;

/**
 * A path inside the folder: forward slashes, no leading slash, no `..`, no
 * empty or dot segments. The browser normalises before sending; the server
 * refuses anything that would escape the round's prefix.
 */
export const bundlePath = z
    .string()
    .min(1)
    .max(240)
    .refine((p) => !p.startsWith('/') && !p.includes('\\') && p.split('/').every((s) => s && s !== '.' && s !== '..'), 'path')
    .refine((p) => (BUNDLE_EXTENSIONS as readonly string[]).includes(p.split('.').pop()!.toLowerCase()), 'type');

export const uploadStart = z.object({
    files: z
        .array(z.object({ path: bundlePath, size: z.number().int().min(0).max(BUNDLE_LIMITS.fileBytes, 'tooBig') }))
        .min(1, 'empty')
        .max(BUNDLE_LIMITS.files, 'tooMany')
        .refine((fs) => fs.reduce((n, f) => n + f.size, 0) <= BUNDLE_LIMITS.totalBytes, 'tooBig')
        .refine((fs) => new Set(fs.map((f) => f.path)).size === fs.length, 'duplicate')
        .refine((fs) => fs.some((f) => !f.path.includes('/') && /\.html?$/i.test(f.path)), 'noPages'),
});
export type UploadStart = z.infer<typeof uploadStart>;

/** One pre-signed PUT per file: the browser sends the bytes straight to storage, never through the API. */
export interface UploadTicket {
    uploadId: string;
    files: { path: string; url: string; headers: Record<string, string> }[];
}

export const uploadCommit = z.object({
    uploadId: z.string().regex(/^[a-f0-9]{24}$/),
    /** The zip's file name, kept so the owner recognises which folder this was. */
    name: z.string().trim().max(160).nullable().default(null),
});
export type UploadCommit = z.infer<typeof uploadCommit>;

export const roundStart = z.object({ note: z.string().trim().max(600, 'tooLong').nullable().default(null) });
export type RoundStart = z.infer<typeof roundStart>;

/**
 * Their verdict, in their words. Changes need a sentence (changes with
 * nothing written is a round nobody can act on in three days); an approval
 * does not.
 */
export const roundVerdict = z
    .object({
        verdict: z.enum(['approved', 'changes']),
        page: z.string().trim().max(200).nullable().default(null),
        body: z.string().trim().max(4000, 'tooLong').default(''),
    })
    .refine((v) => v.verdict === 'approved' || v.body.length > 0, { message: 'required', path: ['body'] });
export type RoundVerdict = z.infer<typeof roundVerdict>;

export interface RoundPage {
    /** From the page's <title>, or its file name when it has none. */
    name: string;
    file: string;
    /** The screenshot taken when the round was frozen. Null until screenshots land. */
    snap: string | null;
}

export interface RoundComment {
    page: string | null;
    at: string;
    body: string;
}

export interface RoundView {
    id: string;
    projectId: string;
    v: number;
    state: RoundState;
    note: string | null;
    /** Where the working folder was uploaded from: the zip's name, for the owner's own memory. */
    sourceName: string | null;
    frozen: boolean;
    sentAt: string | null;
    decidedAt: string | null;
    pages: RoundPage[];
    comments: RoundComment[];
}

/** A short-lived address that serves a round's files, so its pages open in a tab with relative links intact. */
export interface RoundViewLink {
    base: string;
    expires: string;
}
