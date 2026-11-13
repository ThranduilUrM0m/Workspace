// One conversion per real enquiry, counted here and never from /thanks
// pageviews (public-forms.md §6). Called only after the spam checks and
// only for a new enquiry: bots, retried sends and a /contact addition to a
// footer enquiry never count. A no-op until Umami is wired (M12), when an
// `UmamiConversions` posting to `/api/send` replaces it in the module.
export const CONVERSIONS = Symbol('Conversions');

export type Conversion = { source: 'footer' | 'contact'; locale: string };

export interface Conversions {
    count(c: Conversion): Promise<void>;
}

export class NoConversions implements Conversions {
    async count(c: Conversion) {
        void c;
    }
}
