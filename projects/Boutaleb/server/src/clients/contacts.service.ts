import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ContactKind, ContactView, RecentContact } from '@repo/schemas';
import type { Client } from './client.schema.js';
import type { Model, Types } from 'mongoose';
import { studioDay } from '../common/day.js';
import type { Project } from '../projects/project.schema.js';
import { CONTACT, type Contact } from './contact.schema.js';

type Populated = Omit<Contact, 'project'> & { project: Pick<Project, '_id' | 'name'> | null };

/** The facts a client row derives from: the last time they acted, the first entry, the count. */
export interface ContactFacts {
    lastTheirs: string | null;
    firstContact: string | null;
    contacts: number;
}

const NONE: ContactFacts = { lastTheirs: null, firstContact: null, contacts: 0 };

// The one writer and reader of the contact log. Other modules (Deals, the
// enquiry path, magic links later) append through `add`; nothing edits or
// deletes an entry.
@Injectable()
export class ContactsService {
    constructor(@InjectModel(CONTACT) private readonly contacts: Model<Contact>) {}

    add(e: {
        client: Types.ObjectId | string;
        kind: ContactKind;
        text: string;
        at?: string;
        project?: Types.ObjectId | string | null;
        by?: string | null;
    }) {
        return this.contacts.create({
            client: e.client,
            kind: e.kind,
            text: e.text.slice(0, 500),
            at: e.at ?? studioDay(),
            project: e.project ?? null,
            by: e.by ?? null,
        });
    }

    async list(client: Types.ObjectId | string): Promise<ContactView[]> {
        const rows = await this.contacts
            .find({ client })
            .sort({ at: -1, createdAt: -1 })
            .populate('project', 'name')
            .lean<Populated[]>();
        return rows.map((c) => ({
            id: String(c._id),
            at: c.at,
            kind: c.kind,
            text: c.text,
            project: c.project ? { id: String(c.project._id), name: c.project.name } : null,
        }));
    }

    /** The last few entries across every client, for the list's rail. */
    async recent(limit = 8): Promise<RecentContact[]> {
        const rows = await this.contacts
            .find()
            .sort({ at: -1, createdAt: -1 })
            .limit(limit)
            .populate('project', 'name')
            .populate('client', 'name')
            .lean<(Omit<Populated, 'client'> & { client: Pick<Client, '_id' | 'name'> | null })[]>();
        return rows
            .filter((c) => c.client)
            .map((c) => ({
                id: String(c._id),
                at: c.at,
                kind: c.kind,
                text: c.text,
                project: c.project ? { id: String(c.project._id), name: c.project.name } : null,
                client: { id: String(c.client!._id), name: c.client!.name },
            }));
    }

    /** One pass over the log for many clients. Days compare as strings (YYYY-MM-DD). */
    async facts(clients: Types.ObjectId[]): Promise<Map<string, ContactFacts>> {
        const rows = await this.contacts.aggregate<{
            _id: Types.ObjectId;
            lastTheirs: string | null;
            firstContact: string;
            contacts: number;
        }>([
            { $match: { client: { $in: clients } } },
            {
                $group: {
                    _id: '$client',
                    lastTheirs: {
                        $max: { $cond: [{ $in: ['$kind', ['reply', 'call']] }, '$at', null] },
                    },
                    firstContact: { $min: '$at' },
                    contacts: { $sum: 1 },
                },
            },
        ]);
        return new Map(
            rows.map((r) => [
                String(r._id),
                { lastTheirs: r.lastTheirs ?? null, firstContact: r.firstContact, contacts: r.contacts },
            ]),
        );
    }

    static none = NONE;
}
