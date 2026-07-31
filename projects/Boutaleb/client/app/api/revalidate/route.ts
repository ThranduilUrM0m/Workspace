// App Router file — coexists with pages/ (Pages Router). See decisions/ADR-010-nextjs-app-router-incremental-adoption.md
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const paths: string[] = Array.isArray(body.paths) && body.paths.length > 0
    ? body.paths
    : ['/sitemap.xml'];

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, paths, now: Date.now() });
}
