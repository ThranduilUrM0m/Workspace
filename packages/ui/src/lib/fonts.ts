import { Space_Grotesk, Manrope } from 'next/font/google';

// Google Fonts
export const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
});

export const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-manrope',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800'],
});

