// The email that carries the link (T8.4). The API only queues it; it never
// waits for a mail server. Same shape as enquiry-jobs.ts.

export const PORTAL_JOBS = Symbol('PortalJobs');

/** The job reads the project and its client itself; only the link, which cannot be recomputed from a hash, travels. */
export type PortalLinkPayload = { projectId: string; url: string };

export interface PortalJobs {
    sendLink(payload: PortalLinkPayload): Promise<void>;
}

/** No Trigger.dev key (tests, a bare local run): remembers instead of sending. */
export class HeldPortalJobs implements PortalJobs {
    readonly held: PortalLinkPayload[] = [];
    async sendLink(payload: PortalLinkPayload) {
        this.held.push(payload);
    }
}
