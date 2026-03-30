import * as React from 'react';
import { FieldShell } from './FieldShell';
import type { SelectOption } from '../types';

export interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    hint?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export function SelectField({
    id,
    label,
    hint,
    error,
    options,
    placeholder = 'Select an option',
    className,
    required,
    ...props
}: SelectFieldProps) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
        <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
            <select
                className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10 ${className ?? ''}`.trim()}
                required={required}
                defaultValue={props.defaultValue ?? ''}
                {...props}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FieldShell>
    );
}
