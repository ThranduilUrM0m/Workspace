import { useEffect } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, minimum: 0.08 });

export default function TopProgress(): null {
  useEffect((): (() => void) => {
    const handleStart = (): void => { NProgress.start(); };
    const handleStop = (): void => { NProgress.done(); };

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return (): void => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, []);
  return null;
}
