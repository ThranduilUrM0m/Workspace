import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const sidebarRoutes = [
    {
        section: 'Core',
        items: [
            { label: 'Overview', href: '/dashboard' },
            { label: 'Intake', href: '/dashboard/intake' },
            { label: 'Projects', href: '/dashboard/projects' },
        ],
    },
    {
        section: 'ERP Modules',
        items: [
            { label: 'Quotes', href: '/dashboard/erp/quotes' },
            { label: 'Invoices', href: '/dashboard/erp/invoices' },
            { label: 'Payments', href: '/dashboard/erp/payments' },
            { label: 'Purchase Orders', href: '/dashboard/erp/purchase-orders' },
            { label: 'Inventory', href: '/dashboard/erp/inventory' },
            { label: 'Maintenance', href: '/dashboard/erp/maintenance' },
            { label: 'Field Ops', href: '/dashboard/erp/field-ops' },
            { label: 'Finance', href: '/dashboard/erp/finance' },
            { label: 'HR', href: '/dashboard/erp/hr' },
        ],
    },
];

export interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const router = useRouter();
    const isActive = (href: string) =>
        router.pathname === href || router.pathname.startsWith(href + '/');

    return (
        <aside className={`w-64 border-r border-border bg-surface ${className ?? ''}`.trim()}>
            <div className="flex h-full flex-col">
                {/* Sidebar Header */}
                <div className="border-b border-border px-6 py-4">
                    <Link
                        href="/dashboard"
                        className="font-display text-sm font-semibold text-primary"
                    >
                        Dashboard
                    </Link>
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 overflow-auto px-3 py-6 space-y-8">
                    {sidebarRoutes.map((section) => (
                        <div key={section.section} className="space-y-1.5">
                            <h4 className="px-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                                {section.section}
                            </h4>
                            <div className="space-y-0.5">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`block rounded-md px-3 py-2 text-sm transition ${
                                            isActive(item.href)
                                                ? 'bg-primary text-surface font-semibold'
                                                : 'text-text hover:bg-bg'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="border-t border-border px-3 py-4">
                    <button className="w-full rounded-md bg-bg px-3 py-2 text-sm text-muted hover:text-text transition">
                        Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
}
