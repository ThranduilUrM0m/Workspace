import * as React from 'react';
import { FieldShell } from './FieldShell';

export interface RichTextFieldProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    hint?: string;
    error?: string;
    required?: boolean;
    toolbar?: React.ReactNode;
}

export function RichTextField({
    id,
    label,
    value,
    onChange,
    hint,
    error,
    required,
    toolbar,
}: RichTextFieldProps) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
        <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                    {toolbar ?? (
                        <>
                            <button
                                type="button"
                                className="rounded-md border border-border px-2 py-1 text-xs text-text"
                            >
                                Bold
                            </button>
                            <button
                                type="button"
                                className="rounded-md border border-border px-2 py-1 text-xs text-text"
                            >
                                Italic
                            </button>
                            <button
                                type="button"
                                className="rounded-md border border-border px-2 py-1 text-xs text-text"
                            >
                                List
                            </button>
                        </>
                    )}
                </div>
                <textarea
                    id={fieldId}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="min-h-[220px] w-full resize-y border-0 px-4 py-3 text-sm text-text outline-none"
                />
            </div>
        </FieldShell>
    );
}
