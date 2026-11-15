import { tasks } from '@trigger.dev/sdk';
import type { PortalJobs, PortalLinkPayload } from './portal-jobs.js';

/** The real queue. The idempotency key is the link itself: a retry sends once, a re-issue (new link) sends again. */
export class TriggerPortalJobs implements PortalJobs {
    async sendLink(payload: PortalLinkPayload) {
        await tasks.trigger('portal-link-email', payload, { idempotencyKey: `portal-link-email:${payload.url}` });
    }
}
