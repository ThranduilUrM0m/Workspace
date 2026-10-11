'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from '@/i18n/navigation';

// The case study opened from the grid: a native <dialog> with showModal()
// (inert page, focus trap, Esc, ::backdrop). Closing goes back in history,
// so the URL returns to /portfolio and Back/Forward behave as expected.

export function CaseStudyDialog({ titleId, title, meta, children }: { titleId: string; title: string; meta: string; children: ReactNode }) {
    const ref = useRef<HTMLDialogElement>(null);
    const router = useRouter();

    useEffect(() => {
        const d = ref.current;
        if (d && !d.open) d.showModal();
    }, []);

    // Esc fires `cancel` then `close`; the button and a backdrop click call
    // close(). Every path ends here, once.
    const onClose = () => router.back();

    const onClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close();
    };

    return (
        <dialog ref={ref} className="case-v1 modal" aria-labelledby={titleId} onClose={onClose} onClick={onClick}>
            <div className="m-head">
                <div className="htitle">
                    <span className="proj">{title}</span>
                    <span className="meta">{meta}</span>
                </div>
                <button className="close-btn" type="button" aria-label="Close" onClick={() => ref.current?.close()}>
                    <span className="x" aria-hidden="true">
                        ✕
                    </span>
                    <span className="word" aria-hidden="true">
                        Close
                    </span>
                </button>
            </div>
            {children}
        </dialog>
    );
}
