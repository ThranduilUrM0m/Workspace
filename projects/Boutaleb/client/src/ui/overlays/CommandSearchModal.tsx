import * as React from 'react';
import { ModalDialog } from '../ModalDialog';
import type { CommandItem } from '../types';

export interface CommandSearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    query: string;
    onQueryChange: (value: string) => void;
    items: CommandItem[];
    onSelect: (item: CommandItem) => void;
    emptyMessage?: string;
}

export function CommandSearchModal({
    open,
    onOpenChange,
    query,
    onQueryChange,
    items,
    onSelect,
    emptyMessage = 'No matching result.',
}: CommandSearchModalProps) {
    const filtered = React.useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!search) return items;
        return items.filter((item) =>
            `${item.label} ${item.description ?? ''}`.toLowerCase().includes(search)
        );
    }, [items, query]);

    return (
        <ModalDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Search"
            description="Find projects, tickets, ERP records, or commands."
        >
            <div className="space-y-4">
                <input
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search for project, ticket, invoice, or command"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />

                <div className="max-h-[360px] space-y-2 overflow-auto">
                    {filtered.length === 0 ? (
                        <p className="rounded-xl border border-border bg-bg px-4 py-6 text-sm text-muted">
                            {emptyMessage}
                        </p>
                    ) : null}
                    {filtered.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-left hover:bg-bg"
                            onClick={() => onSelect(item)}
                        >
                            <span>
                                <span className="block text-sm font-medium text-text">
                                    {item.label}
                                </span>
                                {item.description ? (
                                    <span className="mt-1 block text-xs text-muted">
                                        {item.description}
                                    </span>
                                ) : null}
                            </span>
                            {item.shortcut ? (
                                <span className="text-xs uppercase tracking-[0.2em] text-muted">
                                    {item.shortcut}
                                </span>
                            ) : null}
                        </button>
                    ))}
                </div>
            </div>
        </ModalDialog>
    );
}
