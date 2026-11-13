// What happens after an enquiry is written: the receipt to the visitor and
// the notice to the owner (public-forms.md §5). The API only queues them;
// it never waits for an email. One interface, so the request path does not
// know whether Trigger.dev is configured.

export const ENQUIRY_JOBS = Symbol('EnquiryJobs');

export interface EnquiryJobs {
    /**
     * `first`: a new enquiry (receipt + notice). A /contact addition to an
     * existing one sends the owner a notice only: the receipt goes once.
     */
    queue(enquiryId: string, first: boolean): Promise<void>;
}

/** No Trigger.dev key (tests, a bare local run): remembers instead of sending. */
export class HeldJobs implements EnquiryJobs {
    readonly held: { enquiryId: string; first: boolean }[] = [];
    async queue(enquiryId: string, first: boolean) {
        this.held.push({ enquiryId, first });
    }
}
