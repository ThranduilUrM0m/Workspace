/**
 * File storage behind one interface (T7.5d). Two adapters: a local folder
 * for development, Oracle Object Storage through its S3-compatible API for
 * real use. Nothing outside src/storage knows which one is running.
 *
 * Uploads never pass through the API: the API hands out a pre-signed PUT
 * per file and the browser sends the bytes straight to storage. Reads that
 * need to keep a folder's relative links intact (a round's pages) are
 * streamed by the API, because a pre-signed GET signs one file, not a
 * folder.
 */
export interface ObjectStore {
    /** Where the browser PUTs one file, and the headers it must send with it. */
    presignPut(key: string, contentType: string, bytes: number): Promise<{ url: string; headers: Record<string, string> }>;
    /** Every key under a prefix, in no promised order. */
    list(prefix: string): Promise<string[]>;
    /** The object's bytes, or null when it does not exist. */
    get(key: string): Promise<Buffer | null>;
    /** Copy every object under one prefix to another. Answers how many were copied. */
    copyPrefix(from: string, to: string): Promise<number>;
}

export const OBJECT_STORE = Symbol('ObjectStore');

/** Ten minutes: long enough for a slow upload, short enough that a leaked URL is dead by lunch. */
export const PUT_TTL_SECONDS = 600;
