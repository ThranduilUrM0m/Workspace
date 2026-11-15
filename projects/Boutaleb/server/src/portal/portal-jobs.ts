// The emails that carry the link (T8.4, T8.5). The API only queues them; it
// never waits for a mail server. Same shape as enquiry-jobs.ts.

export const PORTAL_JOBS = Symbol('PortalJobs');

/** The job reads the project and its client itself; only the link, which cannot be recomputed from a hash, travels. */
export type PortalLinkPayload = { projectId: string; url: string };

/** One client, one email, every project they asked for: a link each. */
export type PortalResendPayload = { clientId: string; items: PortalLinkPayload[] };

export interface PortalJobs {
    sendLink(payload: PortalLinkPayload): Promise<void>;
    sendResend(payload: PortalResendPayload): Promise<void>;
}

/** No Trigger.dev key (tests, a bare local run): remembers instead of sending. */
export class HeldPortalJobs implements PortalJobs {
    readonly held: PortalLinkPayload[] = [];
    readonly heldResends: PortalResendPayload[] = [];
    async sendLink(payload: PortalLinkPayload) {
        this.held.push(payload);
    }
    async sendResend(payload: PortalResendPayload) {
        this.heldResends.push(payload);
    }
}
