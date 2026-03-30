import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './Button';

export interface ModalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export function ModalDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
}: ModalDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-40 bg-primary/60 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-soft focus:outline-none">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Dialog.Title className="text-xl font-display font-semibold text-text">
                                {title}
                            </Dialog.Title>
                            {description ? (
                                <Dialog.Description className="mt-2 text-sm text-muted">
                                    {description}
                                </Dialog.Description>
                            ) : null}
                        </div>
                        <Dialog.Close asChild>
                            <Button variant="ghost" aria-label="Close dialog">
                                Close
                            </Button>
                        </Dialog.Close>
                    </div>
                    <div className="mt-6">{children}</div>
                    {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
