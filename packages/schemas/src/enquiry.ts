import { z } from 'zod';

// One POST /enquiries for the footer form and /contact; `source` says which
// (Blueprinting/tech/public-forms.md §1-2). The browser runs these as a
// courtesy; the server's run is the one that counts. Messages are codes, not
// sentences: each form turns them into words in the visitor's language.

export const FIELD_ERRORS = ['required', 'email', 'tooLong'] as const;
export type FieldError = (typeof FIELD_ERRORS)[number];

const text = (max: number) => z.string().trim().max(max, 'tooLong');
const required = (max: number) => text(max).min(1, 'required');
const optional = (max: number) => text(max).optional().or(z.literal(''));

export const PROJECT_TYPES = ['website', 'erp', 'both', 'not-sure'] as const;
export const CATEGORIES = ['new', 'refresh', 'not-sure'] as const;
export const BUDGETS = ['under-2k', '2k-5k', '5k-15k', '15k-plus', 'not-sure'] as const;
export const TIMELINES = ['asap', 'months', 'flexible'] as const;
export const CONTACT_VIA = ['email', 'phone', 'call'] as const;
export const STAGES = ['idea', 'direction', 'ready'] as const;

const base = {
    name: required(120),
    email: z.string().trim().min(1, 'required').max(254, 'tooLong').pipe(z.email('email')).transform((e) => e.toLowerCase()),
    /** Made when the form is first shown, sent with every attempt (§4). */
    idempotencyKey: z.uuid(),
};

/** The footer's short form. */
export const footerEnquiry = z.object({
    ...base,
    projectType: z.enum(PROJECT_TYPES),
    message: required(5000),
});

/** /contact, steps 1-3. Step 3 is optional as a whole. */
export const contactEnquiry = z.object({
    ...base,
    /** Set when the visitor came from a footer send's "Add budget and
     *  timeline": the server adds to that enquiry instead of a new one. */
    lead: z.string().max(40).optional(),
    phone: optional(40),
    category: z.enum(CATEGORIES),
    company: optional(120),
    /** Free text: "mysite.ma" or an Instagram handle are both fine here. */
    site: optional(300),
    message: required(5000),
    budget: z.enum(BUDGETS),
    timeline: z.enum(TIMELINES),
    via: z.enum(CONTACT_VIA),
    timezone: optional(80),
    stage: z.enum(STAGES),
    outcome: optional(2000),
    heard: optional(200),
    refs: optional(1000),
});

/** The fields each /contact step checks before Continue moves on. */
export const CONTACT_STEPS = [
    ['name', 'email', 'phone', 'category', 'company', 'site'],
    ['message', 'budget', 'timeline', 'via', 'timezone', 'stage'],
    ['outcome', 'heard', 'refs'],
] as const satisfies readonly (readonly (keyof z.infer<typeof contactEnquiry>)[])[];

export type FooterEnquiry = z.infer<typeof footerEnquiry>;
export type ContactEnquiry = z.infer<typeof contactEnquiry>;

/** A blog comment: its own record, the same spam layer (§3). */
export const commentInput = z.object({
    ...base,
    comment: required(4000),
    slug: z.string().min(1),
});
export type CommentInput = z.infer<typeof commentInput>;

/** The honeypot's name on every public form (§3). A filled one is a bot. */
export const HONEYPOT = 'nickname';
