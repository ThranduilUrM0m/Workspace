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
  type?: 'text' | 'email' | 'tel' | 'url';
  multiline?: boolean;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
}

export function Field({ name, label, icon, type = 'text', multiline, autoComplete, required, maxLength, className }: FieldProps) {
  const { field, fieldState } = useController({ name });
  const { clearErrors } = useFormContext();
  const words = useErrorWords();
  const id = React.useId();
  const badgeId = `${id}-err`;
  const error = fieldState.error?.message;
  const pad = useBadgePadding(error);

  const control = {
    id,
    name: field.name,
    value: field.value ?? '',
    onChange: field.onChange,
    onBlur: field.onBlur,
    onFocus: () => error && clearErrors(name),
    placeholder: ' ',
    autoComplete,
    required,
    maxLength,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? badgeId : undefined,
    style: pad.style,
  };

  return (
    <div ref={pad.ref} className={className ? `f-field ${className}` : 'f-field'} data-invalid={error ? '' : undefined}>
      <span className="f-ico" aria-hidden="true">
        {icon}
      </span>
      {multiline ? (
        <textarea {...control} ref={field.ref} />
      ) : (
        <input {...control} ref={field.ref} type={type} />
      )}
      <label className="f-lbl" htmlFor={id}>
        {label}
      </label>
      {error && (
        <span className="f-badge" id={badgeId}>
          {words[error] ?? error}
        </span>
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
