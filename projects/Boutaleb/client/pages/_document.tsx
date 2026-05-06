import { Head, Html, Main, NextScript } from 'next/document';
import '@repo/ui/styles/globals.scss';

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                {/* Favicon */}
                <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <meta name="theme-color" content="#0E1016" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
