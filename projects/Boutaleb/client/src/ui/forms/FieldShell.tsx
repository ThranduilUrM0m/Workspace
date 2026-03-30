import * as React from 'react';

export interface FieldShellProps {
    id: string;
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    action?: React.ReactNode;
    children: React.ReactElement<any>;
}

export function FieldShell({
    id,
    label,
    required,
    hint,
    error,
    action,
    children,
}: FieldShellProps) {
    const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
        .filter(Boolean)
        .join(' ');

    const content = React.cloneElement(children, {
        id,
        'aria-invalid': Boolean(error) || undefined,
        'aria-describedby': describedBy || undefined,
    });

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium text-text">
                    {label}
                    {required ? <span className="ml-1 text-danger">*</span> : null}
                </label>
                {action}
            </div>
            {content}
            {hint ? (
                <p id={`${id}-hint`} className="text-xs text-muted">
                    {hint}
                </p>
            ) : null}
            {error ? (
                <p id={`${id}-error`} className="text-xs text-danger" role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
