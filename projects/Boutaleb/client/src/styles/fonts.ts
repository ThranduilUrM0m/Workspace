import { Manrope, Space_Grotesk } from 'next/font/google';

export const manrope = Manrope({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-manrope',
});

export const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-space-grotesk',
});
