'use client';

import * as React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useErrorWords } from './Form';

/* C3 Field and C4 SelectField (component map). Styles: field.css. Must sit
   inside <Form>; the schema names the rules, the form names the words.
   Markup order is icon, control, label, badge: the label floats from the
   control's own state through a sibling selector. */

interface Common {
  name: string;
  label: string;
  /* The icon well's glyph (decorative; the label names the field). */
  icon: React.ReactNode;
  className?: string;
}

export interface FieldProps extends Common {
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  multiline?: boolean;
  /* A password field's show/hide toggle, at the end edge. The badge sits
     before it and the padding measure absorbs both (field.css .f-reveal). */
  reveal?: boolean;
  /* Extra ids for aria-describedby: a checklist the field is judged by. */
  describedBy?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
  maxLength?: number;
}

export function Field({ name, label, icon, type = 'text', multiline, reveal, describedBy, autoComplete, inputMode, required, maxLength, className }: FieldProps) {
  const { field, fieldState } = useController({ name });
  const { clearErrors } = useFormContext();
  const words = useErrorWords();
  const id = React.useId();
  const badgeId = `${id}-err`;
  const error = fieldState.error?.message;
  const pad = useBadgePadding(error);
  // A failed submit moves focus to the first bad field. That focus must not
  // clear the error it is pointing at, so a focus that lands within a
  // moment of the error appearing is the form's, not the person's.
  const shownAt = React.useRef(0);
  React.useLayoutEffect(() => {
    if (error) shownAt.current = performance.now();
  }, [error]);
  const [shown, setShown] = React.useState(false);
  const describe = [error && badgeId, describedBy].filter(Boolean).join(' ') || undefined;

  const control = {
    id,
    name: field.name,
    value: field.value ?? '',
    onChange: field.onChange,
    onBlur: field.onBlur,
    onFocus: () => error && performance.now() - shownAt.current > 300 && clearErrors(name),
    placeholder: ' ',
    autoComplete,
    inputMode,
    required,
    maxLength,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describe,
    style: pad.style,
  };

  return (
    <div
      ref={pad.ref}
      className={['f-field', reveal && 'f-field--reveal', className].filter(Boolean).join(' ')}
      data-invalid={error ? '' : undefined}
    >
      <span className="f-ico" aria-hidden="true">
        {icon}
      </span>
      {multiline ? (
        <textarea {...control} ref={field.ref} />
      ) : (
        <input {...control} ref={field.ref} type={reveal && shown ? 'text' : type} />
      )}
      <label className="f-lbl" htmlFor={id}>
        {label}
      </label>
      {error && (
        <span className="f-badge" id={badgeId}>
          {words[error] ?? error}
        </span>
      )}
      {reveal && (
        <button
          type="button"
          className="f-reveal"
          aria-pressed={shown}
          aria-label={shown ? 'Hide password' : 'Show password'}
          onClick={() => setShown((v) => !v)}
        >
          {shown ? EYE_OFF : EYE}
        </button>
      )}
    </div>
  );
}

export interface SelectFieldProps extends Common {
  options: readonly { value: string; label: string }[];
}

/* The phone keeps its native picker; a select always has a value, so its
   label is raised from the start. */
export function SelectField({ name, label, icon, options, className }: SelectFieldProps) {
  const { field } = useController({ name });
  const id = React.useId();
  return (
    <div className={className ? `f-field f-field--sel ${className}` : 'f-field f-field--sel'}>
      <span className="f-ico" aria-hidden="true">
        {icon}
      </span>
      <select id={id} name={field.name} value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <label className="f-lbl" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}

const EYE = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EYE_OFF = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2 2l20 20M10.6 6.2A9.9 9.9 0 0 1 12 6c7 0 11 6 11 6a18 18 0 0 1-3.4 4M6.3 8.3A18 18 0 0 0 1 12s4 6 11 6a10 10 0 0 0 3.6-.7" />
  </svg>
);

/* The text box ends where the badge begins: measure the badge's start edge
   to the field's end edge and pad by that much. Errors never arrive
   mid-keystroke, so this runs only when one appears or clears. */
function useBadgePadding(error: string | undefined) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [end, setEnd] = React.useState<number>();
  React.useLayoutEffect(() => {
    const box = ref.current;
    const badge = box?.querySelector<HTMLElement>('.f-badge');
    if (!box || !badge) return setEnd(undefined);
    const b = badge.getBoundingClientRect();
    const f = box.getBoundingClientRect();
    const rtl = getComputedStyle(box).direction === 'rtl';
    setEnd((rtl ? b.right - f.left : f.right - b.left) + 8);
  }, [error]);
  return { ref, style: end === undefined ? undefined : { paddingInlineEnd: `${end / 16}rem` } };
}
