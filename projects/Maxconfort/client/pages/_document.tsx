import { Head, Html, Main, NextScript } from 'next/document';
import { inter } from '../src/styles/fonts';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className={`${inter.className} ${inter.variable}`}>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
