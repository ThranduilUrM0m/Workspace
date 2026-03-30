import * as React from 'react';
import { FieldShell } from './FieldShell';
import type { AutocompleteOption } from '../types';

export interface AutocompleteFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onSelect?: (option: AutocompleteOption) => void;
    options: AutocompleteOption[];
    placeholder?: string;
    hint?: string;
    error?: string;
    required?: boolean;
}

export function AutocompleteField({
    id,
    label,
    value,
    onChange,
    onSelect,
    options,
    placeholder,
    hint,
    error,
    required,
}: AutocompleteFieldProps) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;
    const [open, setOpen] = React.useState(false);

    const filtered = React.useMemo(() => {
        const query = value.trim().toLowerCase();
        if (!query) return options.slice(0, 8);

        return options
            .filter((option) => {
                const haystack = [option.label, option.meta, ...(option.keywords ?? [])]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(query);
            })
            .slice(0, 8);
    }, [options, value]);

    return (
        <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
            <div className="relative">
                <input
                    value={value}
                    onChange={(event) => {
                        onChange(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => window.setTimeout(() => setOpen(false), 120)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />

                {open && filtered.length > 0 ? (
                    <div
                        className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface p-2 shadow-soft"
                        role="listbox"
                    >
                        {filtered.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className="flex w-full items-start justify-between rounded-lg px-3 py-2 text-left hover:bg-bg"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                    onChange(option.label);
                                    onSelect?.(option);
                                    setOpen(false);
                                }}
                            >
                                <span>
                                    <span className="block text-sm font-medium text-text">
                                        {option.label}
                                    </span>
                                    {option.meta ? (
                                        <span className="block text-xs text-muted">
                                            {option.meta}
                                        </span>
                                    ) : null}
                                </span>
                                {option.group ? (
                                    <span className="text-xs uppercase tracking-[0.2em] text-muted">
                                        {option.group}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </FieldShell>
    );
}
