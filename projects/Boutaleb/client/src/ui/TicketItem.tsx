import * as React from 'react';
import Link from 'next/link';
import { Badge, Button } from './index';

export interface TicketItemProps {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'P0' | 'P1' | 'P2';
    labels?: string[];
    assignee?: { name: string; avatar?: string };
    estimateHours?: number;
    projectId?: string;
    onStatusChange?: (newStatus: string) => void;
    className?: string;
}

const statusColors = {
    todo: 'bg-muted/10 text-muted border-muted/20',
    'in-progress': 'bg-info/10 text-info border-info/20',
    review: 'bg-warning/10 text-warning border-warning/20',
    done: 'bg-success/10 text-success border-success/20',
} as const;

const priorityColors = {
    P0: 'text-danger',
    P1: 'text-warning',
    P2: 'text-muted',
} as const;

export function TicketItem({
    id,
    title,
    description,
    status,
    priority,
    labels = [],
    assignee,
    estimateHours,
    projectId,
    onStatusChange,
    className,
}: TicketItemProps) {
    return (
        <article
            className={`rounded-lg border border-border bg-surface p-4 hover:shadow-soft transition ${className ?? ''}`.trim()}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={
                                projectId
                                    ? `/dashboard/projects/${projectId}/plan#ticket-${id}`
                                    : '#'
                            }
                            className="font-semibold text-primary hover:underline"
                        >
                            {title}
                        </Link>
                        <Badge variant="default" className={`text-xs whitespace-nowrap`}>
                            <span className={`font-bold ${priorityColors[priority]}`}>
                                {priority}
                            </span>
                        </Badge>
                        <Badge
                            variant="default"
                            className={`text-xs border ${statusColors[status]}`}
                        >
                            {status.replace('-', ' ')}
                        </Badge>
                    </div>

                    {description ? (
                        <p className="mt-1.5 text-sm text-muted line-clamp-2">{description}</p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {labels.map((label) => (
                            <Badge key={label} variant="default" className="text-xs">
                                {label}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    {estimateHours ? (
                        <div className="text-right">
                            <p className="text-xs text-muted">Est.</p>
                            <p className="text-sm font-semibold text-primary">{estimateHours}h</p>
                        </div>
                    ) : null}

                    {assignee ? (
                        <div className="text-right">
                            {assignee.avatar ? (
                                <img
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                    className="h-8 w-8 rounded-full"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold">
                                    {assignee.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            {onStatusChange ? (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    {['todo', 'in-progress', 'review', 'done'].map((s) => (
                        <button
                            key={s}
                            onClick={() => onStatusChange(s)}
                            disabled={status === s}
                            className={`text-xs px-2 py-1 rounded transition ${
                                status === s
                                    ? 'bg-primary text-surface font-semibold'
                                    : 'bg-bg text-muted hover:bg-border'
                            }`}
                        >
                            {s.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            ) : null}
        </article>
    );
}
