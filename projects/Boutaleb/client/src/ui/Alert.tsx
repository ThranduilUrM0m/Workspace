import * as React from 'react';

const tones = {
    info: 'border-info/30 bg-info/5',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
    danger: 'border-danger/30 bg-danger/5',
} as const;

export interface AlertProps {
    tone?: keyof typeof tones;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
}

export function Alert({
    tone = 'info',
    title,
    description,
    action,
    children,
    className,
}: AlertProps) {
    const role = tone === 'warning' || tone === 'danger' ? 'alert' : 'status';
    const hasStructuredCopy = title || description || action;

    return (
        <div
            role={role}
            className={`rounded-xl border p-4 ${tones[tone]} ${className ?? ''}`.trim()}
        >
            {hasStructuredCopy ? (
                <div className="flex items-start justify-between gap-4">
                    <div>
                        {title ? <p className="text-sm font-semibold text-text">{title}</p> : null}
                        {description ? (
                            <p className="mt-1 text-sm text-muted">{description}</p>
                        ) : null}
                    </div>
                    {action}
                </div>
            ) : null}

            {children ? (
                <div
                    className={
                        hasStructuredCopy
                            ? 'mt-3 text-sm leading-6 text-text'
                            : 'text-sm leading-6 text-text'
                    }
                >
                    {children}
                </div>
            ) : null}
        </div>
    );
}
