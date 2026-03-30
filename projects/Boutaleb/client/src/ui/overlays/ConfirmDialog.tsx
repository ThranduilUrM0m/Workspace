import * as React from 'react';
import { Button } from '../Button';
import { ModalDialog } from '../ModalDialog';

export interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'default' | 'danger';
    onConfirm: () => void;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'default',
    onConfirm,
}: ConfirmDialogProps) {
    return (
        <ModalDialog
            open={open}
            onOpenChange={onOpenChange}
            title={title}
            description={description}
            footer={
                <>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        {cancelLabel}
                    </Button>
                    <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-muted">
                This action should only run after explicit user confirmation.
            </p>
        </ModalDialog>
    );
}
