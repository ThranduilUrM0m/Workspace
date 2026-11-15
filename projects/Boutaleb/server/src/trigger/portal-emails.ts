import { renderPortalLink } from '@repo/emails';
import { task } from '@trigger.dev/sdk';
import type { PortalLinkPayload } from '../portal/portal-jobs.js';
import { mail, mailer, models } from './runtime.js';

// The email that carries a client's magic link (T8.4). The job reads the
// project and its client itself; only the link travels in the payload (it
// cannot be recomputed: the database keeps its hash). Retries:
// trigger.config.ts. A job that fails for good is written to Settings ›
// Activity, as critical, without the link.

type Language = 'en' | 'fr' | 'ar';

export const portalLinkEmail = task({
    id: 'portal-link-email',
    run: async ({ projectId, url }: PortalLinkPayload) => {
        const { projects, clients } = await models();
        const p = await projects.findById(projectId).lean<{ name: string; client: unknown }>();
        const c = p?.client ? await clients.findById(p.client).lean<{ name: string; email: string; language: Language }>() : null;
        if (!p || !c) return { sent: false, reason: 'project or client gone' };
        const { subject, html, text } = await renderPortalLink({ language: c.language, name: c.name, project: p.name, url, site: mail.site() });
        await mailer().sendMail({ from: mail.from(), to: c.email, replyTo: mail.owner(), subject, html, text });
        return { sent: true };
    },
    onFailure: async ({ payload, error }) => {
        const { activity } = await models();
        await activity.create({
            kind: 'system',
            weight: 'critical',
            action: 'portal.link_email_failed',
            section: 'projects',
            target: { type: 'project', id: payload.projectId },
            after: { error: error instanceof Error ? error.message : String(error) },
        });
    },
});
