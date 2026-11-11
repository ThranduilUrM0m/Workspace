import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { BadRequestException, Controller, ForbiddenException, HttpCode, Inject, NotFoundException, PayloadTooLargeException, Put, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/public.decorator.js';
import { LocalStore } from './local.store.js';
import { OBJECT_STORE, type ObjectStore } from './object-store.js';
import { Signer } from './signer.js';

/**
 * The local folder's stand-in for a pre-signed PUT. Public, because the
 * signature IS the authorisation, exactly as it is on S3: it names one key,
 * a byte ceiling and a content type, and dies in ten minutes. Exists only
 * while the local adapter is the one running; with S3 it answers 404.
 */
@Controller('storage')
export class LocalUploadController {
    constructor(
        @Inject(OBJECT_STORE) private readonly store: ObjectStore,
        private readonly signer: Signer,
    ) {}

    @Put('put')
    @Public()
    @HttpCode(200)
    async put(@Query('token') token: string, @Req() req: Request) {
        if (!(this.store instanceof LocalStore)) throw new NotFoundException();
        const claim = this.signer.verify<{ k: string; n: number; t: string }>(token ?? '');
        if (!claim) throw new ForbiddenException();
        if (req.headers['content-type'] !== claim.t) throw new ForbiddenException();
        const file = this.store.path(claim.k);
        if (!file) throw new ForbiddenException();

        await mkdir(dirname(file), { recursive: true });
        let seen = 0;
        const cap = new Transform({
            transform(chunk: Buffer, _enc, done) {
                seen += chunk.length;
                done(seen > claim.n ? new PayloadTooLargeException() : null, chunk);
            },
        });
        try {
            await pipeline(req, cap, createWriteStream(file));
        } catch (e) {
            await rm(file, { force: true });
            throw e instanceof PayloadTooLargeException ? e : new BadRequestException();
        }
        return { ok: true };
    }
}
