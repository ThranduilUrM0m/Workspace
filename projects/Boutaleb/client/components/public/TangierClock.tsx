'use client';

import { useEffect, useState } from 'react';

// Tangier's local time. Intl, not a hard-coded "GMT+1": Morocco drops to
// GMT+0 every Ramadan, and the tz database knows it. Renders --:-- on the
// server so the markup never disagrees with the visitor's clock.
export function TangierClock({ timeZone }: { timeZone: string }) {
    const [time, setTime] = useState('--:--');

    useEffect(() => {
        const fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' });
        const tick = () => setTime(fmt.format(new Date()));
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, [timeZone]);

    return <time className="nf-clock">{time}</time>;
}
