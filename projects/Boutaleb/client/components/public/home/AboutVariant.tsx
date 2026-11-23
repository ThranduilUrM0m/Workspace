'use client';

import { useEffect } from 'react';

// TEMPORARY (About layout round r2, 2026-11-23): ?v=b switches the About
// section to direction B so both stills can be judged on the real page. The
// page stays static; without ?v the section shows direction A. Delete this
// component and the [data-v="b"] CSS once a direction is locked.
export function AboutVariant() {
    useEffect(() => {
        const v = new URLSearchParams(window.location.search).get('v');
        const sec = document.getElementById('sec-about');
        if (sec && v === 'b') sec.dataset.v = 'b';
    }, []);
    return null;
}
