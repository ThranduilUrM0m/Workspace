import * as React from 'react';
import { FieldShell } from './FieldShell';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: string;
    error?: string;
}

export function TextField({
    id,
    label,
    hint,
    error,
    className,
    required,
    ...props
}: TextFieldProps) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
        <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
            <input
                className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 ${className ?? ''}`.trim()}
                required={required}
                {...props}
            />
        </FieldShell>
    );
}
