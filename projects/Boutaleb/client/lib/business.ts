// The business profile (ADR-016): contact facts are data, not markup.
// A constant until the Settings › Business record exists (M12), then this
// module's shape is what the API returns.

export type SocialProfile = { network: 'github' | 'linkedin' | 'x'; url: string };

export const business = {
    brand: 'Boutaleb',
    email: 'hello@boutaleb.dev',
    // IANA zone, never a fixed offset: Morocco drops to GMT+0 every Ramadan.
    timeZone: 'Africa/Casablanca',
    phone: null as string | null,
    // No accounts exist yet; zero profiles render zero rows (ADR-016).
    socialProfiles: [] as SocialProfile[],
};
