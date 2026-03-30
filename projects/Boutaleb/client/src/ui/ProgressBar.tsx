import * as React from 'react';

export interface ProgressBarProps {
    value: number;
    label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div className="space-y-2">
            {label ? (
                <div className="flex justify-between text-sm text-muted">
                    <span>{label}</span>
                    <span>{safeValue}%</span>
                </div>
            ) : null}
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                    className="h-full rounded-full bg-accent transition-[width] duration-300"
                    style={{ width: `${safeValue}%` }}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={safeValue}
                    role="progressbar"
                />
            </div>
        </div>
    );
}
