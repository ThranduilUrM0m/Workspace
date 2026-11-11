'use client';

import * as React from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';

/* C6 OptionRow (component map): a small closed set (a language, an expiry,
   a source) as buttons behind an inline label, not a select: a dropdown
   hides three words behind a click. Radix ToggleGroup, single: arrow keys
   move between options, one tab stop for the row. A pick cannot be
   un-picked by pressing it again; the row always holds what it holds.
   Styles: form.css .fm-optrow. */

export interface OptionRowProps<V extends string> {
  label: string;
  value: V | null;
  options: readonly { value: V; label: string }[];
  onChange: (value: V) => void;
  className?: string;
}

export function OptionRow<V extends string>({ label, value, options, onChange, className }: OptionRowProps<V>) {
  const id = React.useId();
  const [pressed, setPressed] = React.useState<V | null>(null);
  React.useEffect(() => {
    if (!pressed) return;
    const t = setTimeout(() => setPressed(null), 300);
    return () => clearTimeout(t);
  }, [pressed]);
  return (
    <div className={className ? `fm-optrow ${className}` : 'fm-optrow'}>
      <span className="fm-optlbl" id={id}>
        {label}
      </span>
      <ToggleGroup.Root
        type="single"
        className="fm-opts"
        aria-labelledby={id}
        value={value ?? ''}
        onValueChange={(v) => {
          if (!v) return;
          setPressed(v as V);
          onChange(v as V);
        }}
      >
        {options.map((o) => (
          <ToggleGroup.Item key={o.value} value={o.value} className="fm-opt" data-new={pressed === o.value ? '' : undefined}>
            {o.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}
