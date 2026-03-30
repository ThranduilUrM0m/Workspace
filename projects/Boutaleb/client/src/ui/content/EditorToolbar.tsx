import * as React from 'react';

export interface EditorToolbarProps {
    children?: React.ReactNode;
}

export function EditorToolbar({ children }: EditorToolbarProps) {
    return (
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
            {children}
        </div>
    );
}
