// Reading a round's pages out of its folder (structure spec §2: pages are
// read from the bundle, not typed). Every TOP-LEVEL .html is a page; its
// <title> is its name. A regex, not an HTML parser: the one thing read is
// the first <title>, and a parser dependency for one tag in one call site
// buys nothing a bad title would not survive anyway (the file name stands in).

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function titleOf(html: string): string | null {
    const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    if (!m) return null;
    const t = m[1]!
        .replace(/&(#\d+|#x[\da-f]+|\w+);/gi, (all, e: string) =>
            e[0] === '#' ? String.fromCodePoint(Number(e[1]?.toLowerCase() === 'x' ? `0${e.slice(1)}` : e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? all),
        )
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);
    return t || null;
}

/** "about-us.html" -> "About us": the name a page gets when it has no title. */
export function nameFromFile(file: string): string {
    const base = file.replace(/\.html?$/i, '').replace(/[-_]+/g, ' ').trim();
    return base ? base[0]!.toUpperCase() + base.slice(1) : file;
}

export const isPage = (path: string) => !path.includes('/') && /\.html?$/i.test(path);

/** index first, the rest by file name: the order a visitor would meet them in, as near as a folder can say. */
export function pageOrder(a: string, b: string): number {
    const ia = /^index\.html?$/i.test(a);
    const ib = /^index\.html?$/i.test(b);
    return ia === ib ? a.localeCompare(b) : ia ? -1 : 1;
}
