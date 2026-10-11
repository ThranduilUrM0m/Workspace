import { notFound } from 'next/navigation';

// Any path no page claims renders [locale]/not-found.tsx with a real 404.
export default function CatchAll() {
    notFound();
}
