import { tasks } from '@trigger.dev/sdk';
import type { EnquiryJobPayload, EnquiryJobs, EnquiryNoticePayload } from './enquiry-jobs.js';

/**
 * The real queue: two Trigger.dev runs per new enquiry, one per addition.
 * The idempotency keys mean a send that reaches here twice still sends
 * each email once. Task ids and payload types are shared through
 * enquiry-jobs.ts: the jobs' code (src/trigger, bundled by Trigger.dev)
 * is never loaded into the API process. The SDK reads TRIGGER_SECRET_KEY from the environment.
 */
export class TriggerJobs implements EnquiryJobs {
    async queue(enquiryId: string, first: boolean) {
        const runs: Promise<unknown>[] = [
            tasks.trigger('enquiry-notice', { enquiryId, kind: first ? 'new' : 'details' } satisfies EnquiryNoticePayload, { idempotencyKey: `enquiry-notice:${enquiryId}:${first ? 'new' : Date.now()}` }),
        ];
        if (first) runs.push(tasks.trigger('enquiry-receipt', { enquiryId } satisfies EnquiryJobPayload, { idempotencyKey: `enquiry-receipt:${enquiryId}` }));
        await Promise.all(runs);
    }
}
