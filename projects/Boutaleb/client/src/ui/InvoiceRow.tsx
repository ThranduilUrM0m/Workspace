import * as React from 'react';
import { TextField, Badge } from './index';

export interface InvoiceLineItem {
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
    taxRate: number;
    discountPct: number;
}

export interface InvoiceRowProps {
    item: InvoiceLineItem;
    onUpdate: (item: InvoiceLineItem) => void;
    onDelete: (id: string) => void;
    editable?: boolean;
}

export function InvoiceRow({ item, onUpdate, onDelete, editable = true }: InvoiceRowProps) {
    const subtotal = item.qty * item.unitPrice;
    const discount = subtotal * (item.discountPct / 100);
    const taxable = subtotal - discount;
    const tax = taxable * (item.taxRate / 100);
    const total = taxable + tax;

    const handleChange = (field: keyof InvoiceLineItem, value: any) => {
        onUpdate({ ...item, [field]: value });
    };

    return (
        <div className="border-b border-border py-4 px-4 space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-muted uppercase tracking-[0.1em]">
                        Description
                    </label>
                    {editable ? (
                        <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                        />
                    ) : (
                        <p className="mt-1 text-sm text-text">{item.description}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-[0.1em]">
                        Qty
                    </label>
                    {editable ? (
                        <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleChange('qty', parseInt(e.target.value, 10))}
                            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                        />
                    ) : (
                        <p className="mt-1 text-sm text-text">{item.qty}</p>
                    )}
                </div>

                <div>
                    <label className="text-xs font-semibold text-muted uppercase tracking-[0.1em]">
                        Unit Price
                    </label>
                    {editable ? (
                        <input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value))}
                            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
                        />
                    ) : (
                        <p className="mt-1 text-sm text-text">${item.unitPrice.toFixed(2)}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 text-sm">
                <div>
                    <p className="text-muted">Subtotal</p>
                    <p className="font-semibold text-text">${subtotal.toFixed(2)}</p>
                </div>
                <div>
                    <label className="text-muted">Discount</label>
                    {editable ? (
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPct}
                            onChange={(e) =>
                                handleChange('discountPct', parseFloat(e.target.value))
                            }
                            className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs"
                            placeholder="0%"
                        />
                    ) : (
                        <p className="font-semibold text-text">{item.discountPct}%</p>
                    )}
                </div>
                <div>
                    <label className="text-muted">Tax</label>
                    {editable ? (
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.taxRate}
                            onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                            className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1 text-xs"
                            placeholder="0%"
                        />
                    ) : (
                        <p className="font-semibold text-text">{item.taxRate}%</p>
                    )}
                </div>
                <div>
                    <p className="text-muted">Total</p>
                    <p className="font-semibold text-accent">${total.toFixed(2)}</p>
                </div>
            </div>

            {editable ? (
                <div className="flex justify-end pt-2">
                    <button
                        onClick={() => onDelete(item.id)}
                        className="text-xs text-danger hover:text-danger/80 transition font-medium"
                    >
                        Remove Line
                    </button>
                </div>
            ) : null}
        </div>
    );
}
