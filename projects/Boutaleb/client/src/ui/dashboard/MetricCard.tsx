import * as React from 'react';
import { Card } from '../Card';
import { Badge } from '../Badge';
import type { MetricChange } from '../types';

export interface MetricCardProps {
    label: string;
    value: string;
    change?: MetricChange;
}

export function MetricCard({ label, value, change }: MetricCardProps) {
    const variant =
        change?.tone === 'positive'
            ? 'success'
            : change?.tone === 'warning'
              ? 'warning'
              : change?.tone === 'danger'
                ? 'danger'
                : 'default';

    return (
        <Card className="h-full">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{label}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
                <p className="text-3xl font-display font-semibold text-text">{value}</p>
                {change ? (
                    <Badge variant={variant}>
                        {change.label ? `${change.label} ${change.value}` : change.value}
                    </Badge>
                ) : null}
            </div>
        </Card>
    );
}
