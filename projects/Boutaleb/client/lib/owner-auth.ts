import { auth } from '@clerk/nextjs/server';

// Every owner page and server action calls this first. A signed-out visitor
// is sent to /login and back afterwards. It gates the screen only: the API
// checks the same session again on every request (server ClerkAuthGuard).
export async function requireOwnerSession() {
    return auth.protect();
}
