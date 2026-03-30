import * as React from 'react';
import type { TableColumn, BulkAction } from './types';

export interface ERPTableProps<T> {
    columns: TableColumn<T>[];
    rows: T[];
    keyField: keyof T;
    selectable?: boolean;
    onRowClick?: (row: T) => void;
    bulkActions?: BulkAction<T>[];
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
}

export function ERPTable<T extends Record<string, any>>({
    columns,
    rows,
    keyField,
    selectable = false,
    onRowClick,
    bulkActions = [],
    loading = false,
    emptyMessage = 'No records found',
    className,
}: ERPTableProps<T>) {
    const [selectedRows, setSelectedRows] = React.useState<Set<any>>(new Set());

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRows(new Set(rows.map((r) => r[keyField])));
        } else {
            setSelectedRows(new Set());
        }
    };

    const handleSelectRow = (rowKey: any, checked: boolean) => {
        const newSet = new Set(selectedRows);
        if (checked) {
            newSet.add(rowKey);
        } else {
            newSet.delete(rowKey);
        }
        setSelectedRows(newSet);
    };

    if (loading) {
        return (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted">
                Loading...
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-surface p-8 text-center text-muted">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div
            className={`overflow-x-auto rounded-lg border border-border bg-surface ${className ?? ''}`.trim()}
        >
            <table className="w-full text-sm">
                <thead className="border-b border-border bg-bg">
                    <tr>
                        {selectable ? (
                            <th className="px-4 py-3 w-12">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.size === rows.length && rows.length > 0}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    aria-label="Select all rows"
                                    className="rounded border-border accent-accent"
                                />
                            </th>
                        ) : null}
                        {columns.map((col) => (
                            <th
                                key={String(col.key)}
                                className="px-4 py-3 text-left font-semibold text-muted"
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-border">
                    {rows.map((row) => (
                        <tr
                            key={String(row[keyField])}
                            onClick={() => onRowClick?.(row)}
                            className={onRowClick ? 'hover:bg-bg/50 cursor-pointer transition' : ''}
                        >
                            {selectable ? (
                                <td className="px-4 py-3 w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.has(row[keyField])}
                                        onChange={(e) =>
                                            handleSelectRow(row[keyField], e.target.checked)
                                        }
                                        aria-label={`Select row ${row[keyField]}`}
                                        className="rounded border-border accent-accent"
                                    />
                                </td>
                            ) : null}
                            {columns.map((col) => (
                                <td
                                    key={String(col.key)}
                                    className={`px-4 py-3 text-text ${col.className ?? ''}`}
                                >
                                    {col.render
                                        ? col.render(row)
                                        : String(row[col.key as keyof T] ?? '—')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedRows.size > 0 && bulkActions.length > 0 ? (
                <div className="border-t border-border bg-bg px-4 py-3 flex items-center justify-between">
                    <p className="text-sm text-muted">{selectedRows.size} selected</p>
                    <div className="flex gap-2">
                        {bulkActions.map((action) => (
                            <button
                                key={action.label}
                                onClick={() => {
                                    const selectedRowData = rows.filter((r) =>
                                        selectedRows.has(r[keyField])
                                    );
                                    action.onClick(selectedRowData);
                                }}
                                className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                                    action.tone === 'danger'
                                        ? 'bg-danger/10 text-danger hover:bg-danger/20'
                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                }`}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
