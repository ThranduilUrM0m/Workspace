import { Head, Html, Main, NextScript } from 'next/document';
import { manrope, spaceGrotesk } from '../src/styles/fonts';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className={`${manrope.className} ${manrope.variable} ${spaceGrotesk.variable}`}>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
