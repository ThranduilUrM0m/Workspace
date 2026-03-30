import * as React from 'react';

// Local UI-only contracts. Domain models belong in src/types.
export type CTA = {
    label: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    external?: boolean;
};

export type SelectOption = {
    label: string;
    value: string;
    hint?: string;
    disabled?: boolean;
};

export type AutocompleteOption = SelectOption & {
    group?: string;
    keywords?: string[];
    meta?: string;
};

export type ProjectPreview = {
    id: string;
    slug: string;
    title: string;
    industry: string;
    summary: string;
    tags: string[];
    coverImage: string;
    year: number;
    resultMetric: string;
};

export type MetricChange = {
    label?: string;
    value: string;
    tone?: 'neutral' | 'positive' | 'warning' | 'danger';
};

export type CommandItem = {
    id: string;
    label: string;
    description?: string;
    shortcut?: string;
    group?: string;
    href?: string;
    onSelect?: () => void;
};

export type TableColumn<T> = {
    key: keyof T | string;
    header: string;
    className?: string;
    render?: (row: T) => React.ReactNode;
};

export type BulkAction<T> = {
    label: string;
    tone?: 'default' | 'danger';
    onClick: (rows: T[]) => void;
};
