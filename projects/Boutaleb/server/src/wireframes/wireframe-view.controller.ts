import { Controller, Get, Inject, NotFoundException, Param, Res } from '@nestjs/common';
import { bundlePath } from '@repo/schemas';
import type { Response } from 'express';
import mime from 'mime';
import { Public } from '../auth/public.decorator.js';
import { OBJECT_STORE, type ObjectStore } from '../storage/object-store.js';
import { Signer } from '../storage/signer.js';

/**
 * Serves a round's files under a signed, short-lived path segment, so a page
 * opens in its own tab and its relative links (style.css, img/hero.jpg) keep
 * working. A pre-signed storage URL cannot do that: it signs one file.
 *
 * The files are someone's HTML served from the API's own origin, so they are
 * locked in a sandbox: CSP `sandbox` without allow-same-origin gives the page
 * an opaque origin. Its scripts run (wireframes have menus that open), but it
 * cannot read anything of the API's, and any call it makes to the API
 * arrives with Origin: null, which CORS refuses. CORP and ACAO are opened
 * because, from an opaque origin, even its own stylesheet is a cross-origin
 * request.
 */
@Controller('wireframes/view')
export class WireframeViewController {
    constructor(
        @Inject(OBJECT_STORE) private readonly store: ObjectStore,
        private readonly signer: Signer,
    ) {}

    @Get(':token/*path')
    @Public()
    async file(@Param('token') token: string, @Param('path') path: string[] | string, @Res() res: Response) {
        const claim = this.signer.verify<{ wf: string }>(token);
        const rel = Array.isArray(path) ? path.join('/') : path;
        if (!claim || !bundlePath.safeParse(rel).success) throw new NotFoundException();
        const body = await this.store.get(claim.wf + rel);
        if (!body) throw new NotFoundException();
        res.setHeader('Content-Type', mime.getType(rel) ?? 'application/octet-stream');
        res.setHeader('Content-Security-Policy', 'sandbox allow-scripts allow-forms allow-popups allow-modals');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'private, max-age=300');
        res.setHeader('Referrer-Policy', 'no-referrer');
        res.send(body);
    }
}
