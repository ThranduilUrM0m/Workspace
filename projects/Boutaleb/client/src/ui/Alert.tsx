import * as React from 'react';

const tones = {
    info: { shell: 'border-secondary/[0.22] bg-secondary/[0.07]', stripe: 'bg-secondary' },
    success: { shell: 'border-success/[0.24] bg-success/[0.07]', stripe: 'bg-success' },
    warning: { shell: 'border-warning/[0.24] bg-warning/[0.09]', stripe: 'bg-warning' },
    danger: { shell: 'border-danger/[0.24] bg-danger/[0.08]', stripe: 'bg-danger' },
} as const;

export interface AlertProps {
    tone?: keyof typeof tones;
    title?: string;
    description?: string;
    action?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    invert?: boolean;
}

export function Alert({
    tone = 'info',
    title,
    description,
    action,
    children,
    className,
    invert = false,
}: AlertProps) {
    const role = tone === 'warning' || tone === 'danger' ? 'alert' : 'status';
    const hasStructuredCopy = title || description || action;
    const titleClassName = invert
        ? 'text-sm font-semibold tracking-[-0.01em] text-surface'
        : 'text-sm font-semibold tracking-[-0.01em] text-primary';
    const bodyClassName = invert
        ? 'text-sm leading-6 text-surface/[0.74]'
        : 'text-sm leading-6 text-muted';
    const childClassName = invert
        ? 'text-sm leading-6 text-surface/[0.82]'
        : 'text-sm leading-6 text-text';
    return (
        <div
            role={role}
            className={`relative isolate overflow-hidden rounded-[22px] border px-5 py-4 shadow-[0_12px_30px_rgba(14,16,22,0.06)] backdrop-blur-xl ${tones[tone].shell} ${className ?? ''}`.trim()}
        >
            <span
                aria-hidden
                className={`absolute inset-y-4 left-4 w-[3px] rounded-full ${tones[tone].stripe}`}
            />
            <div className="pl-4">
                {hasStructuredCopy ? (
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            {title ? <p className={titleClassName}>{title}</p> : null}
                            {description ? (
                                <p className={`mt-1.5 ${bodyClassName}`}>{description}</p>
                            ) : null}
                        </div>
                        {action}
                    </div>
                ) : null}
                {children ? (
                    <div className={hasStructuredCopy ? `mt-3 ${childClassName}` : childClassName}>
                        {children}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
