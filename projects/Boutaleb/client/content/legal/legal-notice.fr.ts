// The legal notice record, French only (the law it answers is read in
// French), from Blueprinting/wireframes/public/legal.html (Legal notice).
// Each entry is null until the SARL AU is registered; the page counts the
// published ones. When it exists, fill the values here (M11 moves them to
// Settings › Business).

export type NoticeEntry = { label: string; value: string | null; pendingLabel?: string; href?: string };

export const noticeUpdated = '2026-06-14';

export const noticeStatus =
    'L’entreprise qui édite ce site est en cours d’immatriculation. Ses coordonnées légales seront publiées ici dès leur délivrance.';

export const noticeEntries = (brand: string, email: string): NoticeEntry[] => [
    // The brand until the company has a registered name (plan T3.4).
    { label: 'Éditeur', value: brand },
    { label: 'Forme juridique', value: null },
    { label: 'Siège social', value: null },
    { label: 'RC', value: null },
    { label: 'ICE', value: null },
    { label: 'IF', value: null },
    { label: 'Directeur de la publication', value: null },
    { label: 'Déclaration CNDP', value: null, pendingLabel: 'En cours' },
    { label: 'Contact', value: email, href: `mailto:${email}` },
    // The site is served from Netlify; the API and its data from Oracle Cloud
    // (ADR-014). Street addresses are added at the deploy ticket (T13),
    // copied from each provider's own legal page.
    { label: 'Hébergeur', value: 'Site : Netlify, Inc., États-Unis. Données : Oracle Cloud Infrastructure — Oracle Corporation, États-Unis.' },
];

export const PENDING = 'En cours d’immatriculation';
