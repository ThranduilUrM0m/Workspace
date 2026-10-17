'use client';

import { useEffect, useState } from 'react';

const COOLDOWN = 30;

// "Send it again", with a real countdown: a disabled button beside a
// static "in 30s" reads as broken on the screen where someone is already
// unsure anything happened (forgot-password.html).
export function Resend({ onResend }: { onResend: () => Promise<void> }) {
    const [left, setLeft] = useState(COOLDOWN);

    useEffect(() => {
        if (left <= 0) return;
        const t = setTimeout(() => setLeft((n) => n - 1), 1000);
        return () => clearTimeout(t);
    }, [left]);

    return (
        <div className="au-resend">
            <button
                type="button"
                disabled={left > 0}
                onClick={async () => {
                    setLeft(COOLDOWN);
                    await onResend();
                }}
            >
                Send it again
            </button>
            {left > 0 && <span>in {left}s</span>}
        </div>
    );
}
