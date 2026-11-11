import { BUNDLE_EXTENSIONS, BUNDLE_LIMITS } from '@repo/schemas';

// Turning a picked .zip into the folder a round is made of. The zip is read
// in the browser (fflate), so the files go straight to storage one by one
// and the API never touches the archive.
//
// What a real zip of a folder contains, and what this does about it:
// - one wrapping folder ("site/index.html", everything inside "site/"),
//   because zipping a folder from Finder or Explorer does that. Stripped,
//   so index.html is top-level and counts as a page.
// - __MACOSX/ and dotfiles (.DS_Store): skipped, they are the OS's.
// - files of a type a wireframe has no use for (.psd, .md): skipped and
//   counted, so the screen can say what was left out.

const ALLOWED = new Set<string>(BUNDLE_EXTENSIONS);

export interface BundleFile {
    path: string;
    data: Uint8Array;
}

export interface Bundle {
    files: BundleFile[];
    skipped: string[];
}

export type BundleProblem = 'empty' | 'noPages' | 'tooMany' | 'tooBig';

export function readBundle(entries: Record<string, Uint8Array>): Bundle {
    const raw = Object.entries(entries)
        .map(([path, data]) => ({ path: path.replace(/\\/g, '/'), data }))
        .filter((f) => !f.path.endsWith('/'))
        .filter((f) => !f.path.split('/').some((s) => s === '__MACOSX' || s.startsWith('.')));

    // One folder wrapping everything: drop it.
    const first = raw[0]?.path.split('/')[0];
    const wrapped = !!first && raw.length > 0 && raw.every((f) => f.path.startsWith(`${first}/`));
    const files: BundleFile[] = [];
    const skipped: string[] = [];
    for (const f of raw) {
        const path = wrapped ? f.path.slice(first!.length + 1) : f.path;
        const ext = path.split('.').pop()!.toLowerCase();
        const safe = path.split('/').every((s) => s && s !== '.' && s !== '..');
        if (safe && ALLOWED.has(ext)) files.push({ path, data: f.data });
        else skipped.push(path);
    }
    files.sort((a, b) => a.path.localeCompare(b.path));
    return { files, skipped };
}

/** What would stop the server taking this folder, said before anything is sent. */
export function bundleProblem(b: Bundle): BundleProblem | null {
    if (!b.files.length) return 'empty';
    if (!b.files.some((f) => !f.path.includes('/') && /\.html?$/i.test(f.path))) return 'noPages';
    if (b.files.length > BUNDLE_LIMITS.files) return 'tooMany';
    const total = b.files.reduce((n, f) => n + f.data.byteLength, 0);
    if (total > BUNDLE_LIMITS.totalBytes || b.files.some((f) => f.data.byteLength > BUNDLE_LIMITS.fileBytes)) return 'tooBig';
    return null;
}
