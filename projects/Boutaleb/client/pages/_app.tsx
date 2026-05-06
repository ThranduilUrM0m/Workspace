import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { Provider as ReduxProvider } from 'react-redux';
import { useLayoutEffect } from 'react';
import { manrope, spaceGrotesk } from '@repo/ui';
import { store } from '../src/store';
import Layout from '../src/components/Layout';
import TopProgress from '../src/components/TopProgress';
import '../src/styles/globals.scss';

const fontVariableClasses = `${spaceGrotesk.variable} ${manrope.variable}`;

export default function App({ Component, pageProps }: AppProps) {
    // next/font must run from _app (not _document) or CSS variables stay undefined.
    // Mirror classes onto <html> so portals and headings inherit --font-space-grotesk / --font-manrope.
    useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.add(spaceGrotesk.variable, manrope.variable);
        return () => {
            root.classList.remove(spaceGrotesk.variable, manrope.variable);
        };
    }, []);

    return (
        <ClerkProvider {...pageProps}>
            <div className={fontVariableClasses}>
                <ReduxProvider store={store}>
                    <TopProgress />
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                </ReduxProvider>
            </div>
        </ClerkProvider>
    );
}
