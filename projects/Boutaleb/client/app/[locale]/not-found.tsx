import { NotFoundView } from '@/components/public/not-found/NotFoundView';

// Every unknown public path, every language: real 404 status (the catch-all
// calls notFound()), noindex, the floor-plan page from public/404.html.
export default function NotFound() {
    return <NotFoundView />;
}
