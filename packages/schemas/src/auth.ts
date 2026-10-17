import { z } from 'zod';

// The owner-side auth screens (HANDOFF §4). Clerk does the real checks;
// these only shape what is typed before it is sent. English only, so the
// codes stay apart from FIELD_ERRORS, which every public language translates.

export const AUTH_ERRORS = ['required', 'email', 'tooShort', 'noMatch', 'code'] as const;
export type AuthError = (typeof AUTH_ERRORS)[number];

/** NIST SP 800-63B: length, no forced composition. */
export const MIN_PASSWORD = 12;

const email = z.string().trim().min(1, 'required').pipe(z.email('email'));

export const signInForm = z.object({
    email,
    password: z.string().min(1, 'required'),
});
export type SignInForm = z.output<typeof signInForm>;

export const resetRequest = z.object({ email });
export type ResetRequest = z.output<typeof resetRequest>;

/** Clerk's emailed codes are six digits; spaces from a paste are dropped. */
export const resetCode = z.object({
    code: z
        .string()
        .transform((c) => c.replace(/\s+/g, ''))
        .pipe(z.string().min(1, 'required').regex(/^\d{6}$/, 'code')),
});
export type ResetCode = z.output<typeof resetCode>;

export const newPassword = z
    .object({
        password: z.string().min(1, 'required').min(MIN_PASSWORD, 'tooShort'),
        confirm: z.string().min(1, 'required'),
    })
    .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'noMatch' });
export type NewPassword = z.output<typeof newPassword>;
