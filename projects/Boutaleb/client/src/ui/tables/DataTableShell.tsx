import * as React from 'react';
import type { BulkAction, TableColumn } from '../types';
import { EmptyState } from '../feedback/EmptyState';

export interface DataTableShellProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
    getRowKey: (row: T) => string;
    emptyTitle: string;
    emptyDescription: string;
    toolbar?: React.ReactNode;
    bulkActions?: BulkAction<T>[];
    selectedRows?: T[];
}

export function DataTableShell<T>({
    columns,
    rows,
    getRowKey,
    emptyTitle,
    emptyDescription,
    toolbar,
    bulkActions = [],
    selectedRows = [],
}: DataTableShellProps<T>) {
    return (
        <div className="rounded-2xl border border-border bg-surface shadow-soft">
            {toolbar ? <div className="border-b border-border px-5 py-4">{toolbar}</div> : null}
            {bulkActions.length > 0 && selectedRows.length > 0 ? (
                <div className="flex items-center justify-between gap-3 border-b border-border bg-bg px-5 py-3">
                    <p className="text-sm text-muted">{selectedRows.length} row(s) selected</p>
                    <div className="flex gap-2">
                        {bulkActions.map((action) => (
                            <button
                                key={action.label}
                                type="button"
                                className={`rounded-md px-3 py-2 text-sm font-medium ${action.tone === 'danger' ? 'bg-danger text-white' : 'border border-border text-text'}`}
                                onClick={() => action.onClick(selectedRows)}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}

            {rows.length === 0 ? (
                <div className="p-5">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-bg">
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={String(column.key)}
                                        className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted ${column.className ?? ''}`.trim()}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((row) => (
                                <tr key={getRowKey(row)} className="align-top">
                                    {columns.map((column) => (
                                        <td
                                            key={String(column.key)}
                                            className={`px-5 py-4 text-sm text-text ${column.className ?? ''}`.trim()}
                                        >
                                            {column.render
                                                ? column.render(row)
                                                : String((row as any)[column.key as string] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
