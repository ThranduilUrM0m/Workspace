import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ClerkProvider } from '@clerk/nextjs';
import '../src/styles/globals.scss';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../src/store';
import Layout from '../src/components/Layout';
import TopProgress from '../src/components/TopProgress';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <ReduxProvider store={store}>
        <TopProgress />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ReduxProvider>
    </ClerkProvider>
  );
}
