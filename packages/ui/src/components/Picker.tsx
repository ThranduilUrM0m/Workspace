'use client';

import * as React from 'react';
import { Command } from 'cmdk';

/* C8 Picker (component map): search a record, or take one of the exits
   (create one, or none at all). cmdk, inline: results are a plain stack
   under the field, never a popover covering the next field. Up/down move,
   Enter picks, Escape closes. Hover and keyboard are ONE highlight.
   Searching is the caller's (usually the server's), so cmdk does not
   filter. The exits are always the last rows, match or no match: zero
   results is the create path, not a dead end. Styles: form.css .fm-pick-*,
   the search box is a C3 field (field.css). */

export interface PickerExit {
  key: string;
  label: React.ReactNode;
  icon: React.ReactNode;
  onSelect: () => void;
}

export interface PickerProps<T> {
  label: string;
  icon: React.ReactNode;
  query: string;
  onQuery: (q: string) => void;
  items: readonly T[];
  itemKey: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  onPick: (item: T) => void;
  exits: readonly PickerExit[];
  /** What the list says while the first answer is on its way. */
  loading?: boolean;
  autoFocus?: boolean;
}

export function Picker<T>({ label, icon, query, onQuery, items, itemKey, renderItem, onPick, exits, loading, autoFocus }: PickerProps<T>) {
  const id = React.useId();
  const [open, setOpen] = React.useState(!!autoFocus);
  return (
    <Command
      label={label}
      shouldFilter={false}
      loop
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false);
        else if (e.key !== 'Tab') setOpen(true);
      }}
    >
      <div className="f-field">
        <span className="f-ico" aria-hidden="true">
          {icon}
        </span>
        <Command.Input
          id={id}
          value={query}
          onValueChange={(q) => {
            onQuery(q);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder=" "
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <label className="f-lbl" htmlFor={id}>
          {label}
        </label>
      </div>
      {open && (
        // Pressing a row must not blur the box first, or the list closes under the pointer.
        <Command.List className="fm-pick-res" onMouseDown={(e) => e.preventDefault()}>
          {loading && <Command.Loading className="fm-pick-none">Searching…</Command.Loading>}
          {items.map((item) => (
            <Command.Item key={itemKey(item)} value={`item:${itemKey(item)}`} className="fm-pick-row" onSelect={() => onPick(item)}>
              {renderItem(item)}
            </Command.Item>
          ))}
          {exits.map((x) => (
            <Command.Item key={x.key} value={`exit:${x.key}`} className="fm-pick-row fm-pick-new" onSelect={x.onSelect}>
              <span className="fm-pick-plus" aria-hidden="true">
                {x.icon}
              </span>
              <span>{x.label}</span>
            </Command.Item>
          ))}
        </Command.List>
      )}
    </Command>
  );
}

/** The picker collapsed to its answer: one row, and a way to change it. */
export function Picked({ avatar, name, meta, own, onChange }: { avatar?: React.ReactNode; name: string; meta?: React.ReactNode; own?: boolean; onChange: () => void }) {
  return (
    <div className="fm-picked" data-own={own ? '' : undefined}>
      {avatar}
      <span>
        <span className="fm-picked-name">{name}</span>
        {meta && <span className="fm-picked-meta"> · {meta}</span>}
      </span>
      <button type="button" className="fm-link" onClick={onChange}>
        Change
      </button>
    </div>
  );
}
