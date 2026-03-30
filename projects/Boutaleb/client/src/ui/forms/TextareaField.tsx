import * as React from 'react';
import { FieldShell } from './FieldShell';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    hint?: string;
    error?: string;
}

export function TextareaField({
    id,
    label,
    hint,
    error,
    className,
    required,
    ...props
}: TextareaFieldProps) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
        <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
            <textarea
                className={`min-h-[140px] w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 ${className ?? ''}`.trim()}
                required={required}
                {...props}
            />
        </FieldShell>
    );
}
