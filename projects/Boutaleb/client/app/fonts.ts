import { Bricolage_Grotesque, IBM_Plex_Sans_Arabic, Questrial } from 'next/font/google';

// Downloaded at build and served from this origin: no request to Google
// from a visitor's browser. Questrial ships one weight (400) — never ask it
// for bold; heavy text uses Bricolage (theme.css, .font-body-bold).
export const bricolage = Bricolage_Grotesque({
    subsets: ['latin'],
    axes: ['opsz'],
    variable: '--font-bricolage',
    display: 'swap',
});

export const questrial = Questrial({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-questrial',
    display: 'swap',
});

export const plexArabic = IBM_Plex_Sans_Arabic({
    subsets: ['arabic'],
    weight: '400',
    variable: '--font-plex-arabic',
    display: 'swap',
});

export const fontVariables = [bricolage.variable, questrial.variable, plexArabic.variable].join(' ');
