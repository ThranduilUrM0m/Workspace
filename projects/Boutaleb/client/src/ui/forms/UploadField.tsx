import * as React from 'react';
import { FieldShell } from './FieldShell';

export interface UploadFieldProps {
    id?: string;
    label: string;
    hint?: string;
    error?: string;
    required?: boolean;
    accept?: string;
    multiple?: boolean;
    files?: File[];
    onFilesChange?: (files: File[]) => void;
}

export function UploadField({
    id,
    label,
    hint,
    error,
    required,
    accept,
    multiple = false,
    files = [],
    onFilesChange,
}: UploadFieldProps) {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;

    return (
        <FieldShell id={fieldId} label={label} hint={hint} error={error} required={required}>
            <div className="rounded-xl border border-dashed border-border bg-bg/60 p-4">
                <input
                    id={fieldId}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="block w-full text-sm text-text"
                    onChange={(event) => onFilesChange?.(Array.from(event.target.files ?? []))}
                />
                {files.length > 0 ? (
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                        {files.map((file) => (
                            <li key={`${file.name}-${file.size}`}>{file.name}</li>
                        ))}
                    </ul>
                ) : null}
            </div>
        </FieldShell>
    );
}
