import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import { useLayoutEffect } from 'react';
import '../src/styles/globals.scss';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../src/store';
import Layout from '../src/components/Layout';
import TopProgress from '../src/components/TopProgress';
import { manrope, nexa, spaceGrotesk } from '../src/styles/fonts';

const fontVariableClasses = `${nexa.variable} ${spaceGrotesk.variable} ${manrope.variable}`;

export default function App({ Component, pageProps }: AppProps) {
    useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.add(nexa.variable, spaceGrotesk.variable, manrope.variable);
        return () => {
            root.classList.remove(nexa.variable, spaceGrotesk.variable, manrope.variable);
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
