'use client';

import { useEffect, useState } from 'react';

// Settings' spy rule, shared by the legal and blog contents: the current
// section is the last one whose top has passed the upper third of the
// window; at the bottom of the page, the last one.
export function useSectionSpy(ids: string[]) {
    const [on, setOn] = useState(ids[0]);
    const key = ids.join(' ');

    useEffect(() => {
        const list = key.split(' ');
        const spy = () => {
            let current = list[0];
            if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
                current = list[list.length - 1];
            } else {
                for (const id of list) {
                    const sec = document.getElementById(id);
                    if (sec && sec.getBoundingClientRect().top < innerHeight / 3) current = id;
                }
            }
            setOn(current);
        };
        spy();
        addEventListener('scroll', spy, { passive: true });
        return () => removeEventListener('scroll', spy);
    }, [key]);

    return on;
}
