import { Body, Controller, Get, HttpCode, Param, Post, Query, Req } from '@nestjs/common';
import {
    dealCreate,
    dealListQuery,
    dealLose,
    type DealCreate,
    type DealListQuery,
    type DealLose,
} from '@repo/schemas';
import type { AccessRequest } from '../access/access.guard.js';
import { Requires } from '../access/requires.decorator.js';
import { ZodPipe } from '../common/zod.pipe.js';
import { DealsService } from './deals.service.js';

// /deals: list, get, log an enquiry, close as lost. Viewing needs View on
// Deals, every change needs Edit. A deal made with a new client also writes
// that client, so creating one needs Edit on Clients too.
@Controller('deals')
export class DealsController {
    constructor(private readonly deals: DealsService) {}

    @Get()
    @Requires('view', 'deals')
    list(@Query(new ZodPipe(dealListQuery)) q: DealListQuery) {
        return this.deals.list(q);
    }

    @Get(':id')
    @Requires('view', 'deals')
    get(@Param('id') id: string) {
        return this.deals.get(id);
    }

    @Post()
    @Requires('edit', 'deals')
    create(@Body(new ZodPipe(dealCreate)) body: DealCreate, @Req() req: AccessRequest) {
        return this.deals.create(body, req);
    }

    @Post(':id/lose')
    @HttpCode(200)
    @Requires('edit', 'deals')
    lose(
        @Param('id') id: string,
        @Body(new ZodPipe(dealLose)) body: DealLose,
        @Req() req: AccessRequest
    ) {
        return this.deals.lose(id, body, req);
    }
}
