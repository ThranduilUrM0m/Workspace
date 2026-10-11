// Testimonials, headline stats and client names: one source for the homepage
// trust block and the About proof block.
// PLACEHOLDER, LAUNCH-BLOCKING: every value here is wireframe filler, not
// fact (developer decision 2026-10-11: placeholders until launch prep; the
// real values are on the plan's long-lead list, "About proof"). A quote needs
// the client's consent to publish. M11 moves this to the API.

export const proofIsPlaceholder = true;

export type Testimonial = { quote: string; name: string; role: string; company: string };
export type Stat = { value: string; mark: string; title: string; text: string };

export const testimonials: Testimonial[] = [
    {
        quote: 'Shipped faster than I expected, and every choice was explained before it was made.',
        name: 'Client Name',
        role: 'Founder, Web Platform Project',
        company: 'Client One',
    },
    {
        quote: 'Finally a developer who treats the handoff as part of the job, not an afterthought.',
        name: 'Client Name',
        role: 'Ops Lead, Internal Tooling Project',
        company: 'Client Two',
    },
    {
        quote: 'Clear communication throughout, no surprises at delivery.',
        name: 'Client Name',
        role: 'Founder, Web Platform Project',
        company: 'Client Three',
    },
];

export const stats: Stat[] = [
    { value: '12', mark: '+', title: 'Client Projects', text: 'Shipped end to end.' },
    { value: '100', mark: '%', title: 'On-Time Rate', text: 'Every project delivered on schedule.' },
    { value: '5', mark: 'yr', title: 'Experience', text: 'Building web platforms and tooling.' },
    // The one true value: the response promise, in every footer.
    { value: '2', mark: 'd', title: 'Response Time', text: 'Working days, reply window.' },
];

export const clientNames = ['Client One', 'Client Two', 'Client Three', 'Client Four', 'Client Five', 'Client Six', 'Client Seven'];
