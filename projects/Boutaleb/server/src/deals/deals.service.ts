import {
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    DEAL_OPEN,
    type DealCreate,
    type DealListQuery,
    type DealLose,
    type DealView,
    type Language,
} from '@repo/schemas';
import { isValidObjectId, type Model, type QueryFilter } from 'mongoose';
import type { AccessRequest } from '../access/access.guard.js';
import { ActivityService } from '../activity/activity.service.js';
import { CLIENT, clientSummary, type Client } from '../clients/client.schema.js';
import { ContactsService } from '../clients/contacts.service.js';
import { studioDay } from '../common/day.js';
import { ENQUIRY, type Enquiry } from '../enquiries/enquiry.schema.js';
import { DEAL, type Deal } from './deal.schema.js';

type Populated = Omit<Deal, 'client' | 'enquiry'> & { client: Client; enquiry: Enquiry | null };

const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : null);

/** The details a form sent, as strings, empty ones dropped. */
const strings = (o: unknown): Record<string, string> =>
    Object.fromEntries(
        Object.entries((o ?? {}) as Record<string, unknown>).filter(
            ([, v]) => typeof v === 'string' && v !== ''
        ) as [string, string][]
    );

export function view(d: Populated): DealView {
    return {
        id: String(d._id),
        title: d.title,
        stage: d.stage,
        source: d.source,
        value: d.value ?? null,
        priced: d.priced ?? false,
        opened: day(d.opened)!,
        sent: day(d.sent),
        decided: day(d.decided),
        lostWhy: d.lostWhy ?? null,
        note: d.note ?? null,
        client: clientSummary(d.client),
        enquiry: d.enquiry
            ? {
                  id: String(d.enquiry._id),
                  ref: d.enquiry.ref,
                  source: d.enquiry.source,
                  message: d.enquiry.message,
                  details: strings(d.enquiry.details),
                  receivedAt: d.enquiry.createdAt.toISOString(),
              }
            : null,
    };
}

/** What the visitor asked for, in the words the Deals list will show. */
const ASKED: Record<string, string> = {
    website: 'Website',
    erp: 'ERP / internal tool',
    both: 'Website and ERP',
    new: 'New project',
    refresh: 'Refresh / redesign',
};

const LANGS: Language[] = ['fr', 'en', 'ar'];

@Injectable()
export class DealsService {
    constructor(
        @InjectModel(DEAL) private readonly deals: Model<Deal>,
        @InjectModel(CLIENT) private readonly clients: Model<Client>,
        private readonly activity: ActivityService,
        private readonly contacts: ContactsService
    ) {}

    async list(q: DealListQuery): Promise<DealView[]> {
        const filter: QueryFilter<Deal> = {};
        if (q.stage) filter.stage = q.stage;
        if (q.clientId) filter.client = q.clientId;
        const rows = await this.deals
            .find(filter)
            .sort({ opened: -1 })
            .limit(500)
            .populate('client')
            .populate('enquiry')
            .lean<Populated[]>();
        return rows.map(view);
    }

    async get(id: string): Promise<DealView> {
        return view(await this.find(id));
    }

    /** Log an enquiry: a picked client, or a new one saved to Clients as a lead. Always a lead, always your move. */
    async create(input: DealCreate, req: AccessRequest): Promise<DealView> {
        let clientId = input.clientId;
        if (input.newClient) {
            // A new client is a write to Clients: Edit on Deals alone does not reach it.
            if (!req.ability?.can('edit', 'clients'))
                throw new ForbiddenException({ error: 'forbidden' });
            const clash = await this.clients
                .findOne({ email: input.newClient.email })
                .lean<Client>();
            if (clash)
                throw new ConflictException({
                    error: 'invalid',
                    fields: { email: 'taken' },
                    client: clientSummary(clash),
                });
            const c = await this.clients.create({
                ...input.newClient,
                company: input.newClient.company || input.newClient.name,
                status: 'lead',
            });
            clientId = String(c._id);
            await this.activity.record({
                kind: 'change',
                weight: 'notable',
                action: 'client.create',
                actor: req.member,
                section: 'clients',
                target: { type: 'client', id: clientId, label: c.company },
                sessionId: req.auth.sessionId,
            });
        } else {
            const c = await this.clients.findById(clientId).lean<Client>();
            // The studio's own record is a client, not a counterparty: nobody sells to themselves.
            if (!c || c.self)
                throw new UnprocessableEntityException({
                    error: 'invalid',
                    fields: { clientId: 'unknown' },
                });
        }
        const doc = await this.deals.create({
            client: clientId,
            title: input.title,
            source: input.source,
            value: input.value,
            note: input.note || null,
            opened: new Date(),
        });
        const created = await this.find(String(doc._id));
        // They reached out: that is them acting, so it starts the relationship clock.
        await this.contacts.add({
            client: clientId!,
            kind: 'reply',
            text: `Enquiry — ${input.title}`,
            by: req.member ? String(req.member._id) : null,
        });
        await this.log(req, 'deal.create', created, undefined, view(created));
        return view(created);
    }

    /** Close as lost, with the reason. A closed deal stays in the list, folded. */
    async lose(id: string, input: DealLose, req: AccessRequest): Promise<DealView> {
        const before = await this.find(id);
        if (!DEAL_OPEN.includes(before.stage)) throw new ConflictException({ error: 'closed' });
        await this.deals.updateOne(
            { _id: id },
            { $set: { stage: 'lost', lostWhy: input.lostWhy, decided: new Date() } }
        );
        const after = await this.find(id);
        await this.log(req, 'deal.lose', after, view(before), view(after));
        return view(after);
    }

    /**
     * A new public enquiry becomes a lead: the client found by email or
     * created as a lead in the visitor's language, then a deal on it. Runs
     * once per enquiry; a second run finds the deal already there and does
     * nothing (unique index on `enquiry`).
     */
    async fromEnquiry(
        e: Enquiry
    ): Promise<{ dealId: string; clientId: string; newClient: boolean } | null> {
        if (await this.deals.exists({ enquiry: e._id })) return null;
        const details = strings(e.details);
        const language = (LANGS.includes(e.locale as Language) ? e.locale : 'fr') as Language;
        let client = await this.clients.findOne({ email: e.email }).lean<Client>();
        let newClient = false;
        if (!client) {
            try {
                client = (
                    await this.clients.create({
                        name: e.name,
                        company: details.company || e.name,
                        email: e.email,
                        status: 'lead',
                        language,
                        phone: details.phone || undefined,
                        website: details.site || undefined,
                    })
                ).toObject() as Client;
                newClient = true;
            } catch (err) {
                // Two sends from one address at once: the other one made the client.
                if ((err as { code?: number }).code !== 11000) throw err;
                client = await this.clients.findOne({ email: e.email }).lean<Client>();
                if (!client) throw err;
            }
        }
        const asked = ASKED[details.projectType ?? details.category ?? ''] ?? 'Enquiry';
        try {
            const doc = await this.deals.create({
                client: client._id,
                title: `${client.company || client.name} — ${asked}`.slice(0, 120),
                source: 'site',
                opened: e.createdAt ?? new Date(),
                enquiry: e._id,
            });
            await this.contacts.add({
                client: client._id,
                kind: 'reply',
                text: `Site enquiry — ${e.message}`.slice(0, 300),
                at: studioDay(e.createdAt ?? new Date()),
            });
            return { dealId: String(doc._id), clientId: String(client._id), newClient };
        } catch (err) {
            if ((err as { code?: number }).code === 11000) return null;
            throw err;
        }
    }

    private async find(id: string): Promise<Populated> {
        if (!isValidObjectId(id)) throw new NotFoundException({ error: 'not_found' });
        const d = await this.deals
            .findById(id)
            .populate('client')
            .populate('enquiry')
            .lean<Populated>();
        if (!d) throw new NotFoundException({ error: 'not_found' });
        return d;
    }

    private log(req: AccessRequest, action: string, d: Populated, before: unknown, after: unknown) {
        return this.activity.record({
            kind: 'change',
            weight: 'notable',
            action,
            actor: req.member,
            section: 'deals',
            target: { type: 'deal', id: String(d._id), label: d.title },
            before,
            after,
            sessionId: req.auth.sessionId,
        });
    }
}
