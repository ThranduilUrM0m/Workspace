import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function WorkPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/projects');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting...</title>
      </Head>
      <main className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Redirecting...</p>
      </main>
    </>
  );
}
