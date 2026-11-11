import { cp, mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import type { ObjectStore } from './object-store.js';
import { PUT_TTL_SECONDS } from './object-store.js';
import type { Signer } from './signer.js';

/**
 * Development storage: a folder on disk (STORAGE_DIR, gitignored). It keeps
 * the same shape as the real thing, including the pre-signed PUT, which here
 * points at the API's own /storage/put route, signed by the same Signer. The
 * bytes do pass through the API in this one case, and only in development.
 */
export class LocalStore implements ObjectStore {
    readonly root: string;

    constructor(
        dir: string,
        private readonly publicUrl: string,
        private readonly signer: Signer,
    ) {
        this.root = resolve(dir);
    }

    /** The file a key maps to, or null when the key would land outside the root. */
    path(key: string): string | null {
        const p = resolve(this.root, key);
        return p.startsWith(this.root + sep) ? p : null;
    }

    /**
     * Always octet-stream, whatever the file: Express's body parsers would
     * swallow an application/json upload before the route could stream it.
     * Serving reads the type from the extension, so nothing is lost.
     */
    async presignPut(key: string, _contentType: string, bytes: number) {
        const t = 'application/octet-stream';
        const token = this.signer.sign({ k: key, n: bytes, t }, PUT_TTL_SECONDS);
        return { url: `${this.publicUrl}/storage/put?token=${token}`, headers: { 'Content-Type': t } };
    }

    async list(prefix: string): Promise<string[]> {
        const dir = this.path(prefix.replace(/\/$/, ''));
        if (!dir) return [];
        const files = await readdir(dir, { recursive: true, withFileTypes: true }).catch(() => []);
        return files.filter((f) => f.isFile()).map((f) => relative(this.root, join(f.parentPath, f.name)).split(sep).join('/'));
    }

    async get(key: string): Promise<Buffer | null> {
        const p = this.path(key);
        if (!p) return null;
        return readFile(p).catch(() => null);
    }

    async copyPrefix(from: string, to: string): Promise<number> {
        const keys = await this.list(from);
        const src = this.path(from.replace(/\/$/, ''));
        const dst = this.path(to.replace(/\/$/, ''));
        if (!src || !dst || !keys.length) return 0;
        await mkdir(dirname(dst), { recursive: true });
        // Never onto an existing copy: a frozen round is never written again.
        await cp(src, dst, { recursive: true, errorOnExist: true, force: false });
        return keys.length;
    }

    /** Used by the upload route: is this file there, and how big. */
    async size(key: string): Promise<number | null> {
        const p = this.path(key);
        return p ? stat(p).then((s) => s.size, () => null) : null;
    }
}
