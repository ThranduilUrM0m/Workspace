'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm, type FieldValues, type SubmitErrorHandler, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/* C5's form plumbing (component map): React Hook Form + a Zod schema from
   @repo/schemas. The layout half of C5 (title, lede, preview side) comes
   with the first ERP create screen; public forms bring their own layout.

   Errors arrive on blur or submit and never mid-keystroke: RHF's default
   (re-validate on change) would light a field red while it is typed in.
   A failed submit focuses the first bad field; Field keeps its badge. */
export function useSchemaForm<S extends z.ZodType<FieldValues, FieldValues>>(
  schema: S,
  defaultValues: z.input<S>,
): UseFormReturn<z.input<S>, unknown, z.output<S>> {
  return useForm<z.input<S>, unknown, z.output<S>>({
    resolver: zodResolver(schema as never) as never,
    defaultValues: defaultValues as never,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: true,
  });
}

/* Schemas carry codes ("required"); the form turns them into the words of
   the page's language. A code with no word shows as itself, visibly. */
export type ErrorWords = Record<string, string>;
const Words = React.createContext<ErrorWords>({});
export const useErrorWords = () => React.useContext(Words);

/* True while a submit is being checked. A failed submit focuses the first
   bad field, and a field clears its badge on focus; Field reads this to
   tell that focus (the form's) from a person's own. */
const Submitting = React.createContext<React.RefObject<boolean>>({ current: false });
export const useSubmitting = () => React.useContext(Submitting);

export interface FormProps<In extends FieldValues, Out extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onInvalid'> {
  form: UseFormReturn<In, unknown, Out>;
  onSubmit: SubmitHandler<Out>;
  /* A stepped form uses it to open the step holding the first error. */
  onInvalid?: SubmitErrorHandler<In>;
  errorWords: ErrorWords;
  ref?: React.Ref<HTMLFormElement>;
}

export function Form<In extends FieldValues, Out extends FieldValues>({
  form,
  onSubmit,
  onInvalid,
  errorWords,
  children,
  ...props
}: FormProps<In, Out>) {
  const submitting = React.useRef(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    submitting.current = true;
    try {
      await form.handleSubmit(onSubmit, onInvalid)(e);
    } finally {
      // One frame more: a stepped form focuses its first error from a frame
      // it schedules in onInvalid, which runs before this one.
      requestAnimationFrame(() => {
        submitting.current = false;
      });
    }
  };
  return (
    <FormProvider {...form}>
      <Words.Provider value={errorWords}>
        <Submitting.Provider value={submitting}>
        {/* noValidate: the browser's bubbles would race the schema's badges. */}
        <form noValidate onSubmit={submit} {...props}>
          {children}
        </form>
        </Submitting.Provider>
      </Words.Provider>
    </FormProvider>
  );
}

/* C20, the failure half: one sentence above the actions. Saving is the
   Button's `loading`. On failure nothing is reset, so every field keeps its
   value and the focus stays where it was. */
export function FormFail({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="f-fail" role="alert">
      {children}
    </p>
  );
}

/* The spam trap every public form carries (public-forms.md §3): off-screen,
   out of the tab order, hidden from screen readers. A filled one is a bot. */
export function Honeypot({ name = 'nickname' }: { name?: string }) {
  return <input className="f-hp" type="text" name={name} tabIndex={-1} autoComplete="off" aria-hidden="true" />;
}
