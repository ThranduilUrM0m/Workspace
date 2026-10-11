// Umami custom events (seo-boutaleb, plan T12.x). A no-op until Umami is
// wired in M12, so call sites can be written now and light up later.
export function track(event: string, data?: Record<string, string>) {
    void event;
    void data;
}
