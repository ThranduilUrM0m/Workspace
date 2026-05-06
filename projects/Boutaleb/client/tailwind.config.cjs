const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './src/ui/**/*.{js,ts,jsx,tsx,mdx}',
        '../../../packages/ui/src/**/*.{js,ts,jsx,tsx,scss}',
        './node_modules/@radix-ui/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                // Body (Manrope)
                sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
                body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],

                // Headings (Space Grotesk) — alias `display` matches existing `font-display` utilities
                heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
                display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
            },
            fontWeight: {
                thin: '100',
                light: '300',
                normal: '400',
                book: '450',
                bold: '700',
                xbold: '800',
                heavy: '900',
                black: '950',
            },
            fontSize: {
                xs: 'var(--font-size-xs)',
                sm: 'var(--font-size-sm)',
                base: 'var(--font-size-base)',
                lg: 'var(--font-size-lg)',
                xl: 'var(--font-size-xl)',
                '2xl': 'var(--font-size-2xl)',
                '3xl': 'var(--font-size-3xl)',
                '4xl': 'var(--font-size-4xl)',
                '5xl': 'var(--font-size-5xl)',
            },
            lineHeight: {
                tight: 'var(--line-height-tight)',
                snug: 'var(--line-height-snug)',
                normal: 'var(--line-height-normal)',
                relaxed: 'var(--line-height-relaxed)',
                loose: 'var(--line-height-loose)',
            },
            letterSpacing: {
                tighter: 'var(--letter-spacing-tighter)',
                tight: 'var(--letter-spacing-tight)',
                normal: 'var(--letter-spacing-normal)',
                wide: 'var(--letter-spacing-wide)',
                wider: 'var(--letter-spacing-wider)',
                widest: 'var(--letter-spacing-widest)',
            },
            colors: {
                primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
                accent: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
                secondary: 'rgb(var(--color-secondary-rgb) / <alpha-value>)',
                bg: 'rgb(var(--color-bg-rgb) / <alpha-value>)',
                surface: 'rgb(var(--color-surface-rgb) / <alpha-value>)',
                card: 'rgb(var(--color-card-bg-rgb) / <alpha-value>)',
                text: 'rgb(var(--text-dark-rgb) / <alpha-value>)',
                muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
                border: 'rgb(var(--border-color-rgb) / <alpha-value>)',
                success: 'rgb(var(--success-rgb) / <alpha-value>)',
                danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
                warning: 'rgb(var(--warning-rgb) / <alpha-value>)',
                info: 'rgb(var(--info-rgb) / <alpha-value>)',
                white: 'var(--color-surface)',
                black: '#000000',
                background: 'rgb(var(--background-rgb) / <alpha-value>)',
                foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
                'card-foreground': 'rgb(var(--card-foreground-rgb) / <alpha-value>)',
                popover: 'rgb(var(--popover-rgb) / <alpha-value>)',
                'popover-foreground': 'rgb(var(--popover-foreground-rgb) / <alpha-value>)',
                'primary-foreground': 'rgb(var(--primary-foreground-rgb) / <alpha-value>)',
                'secondary-foreground': 'rgb(var(--secondary-foreground-rgb) / <alpha-value>)',
                'accent-foreground': 'rgb(var(--accent-foreground-rgb) / <alpha-value>)',
                'muted-foreground': 'rgb(var(--muted-foreground-rgb) / <alpha-value>)',
                destructive: 'rgb(var(--destructive-rgb) / <alpha-value>)',
                'destructive-foreground': 'rgb(var(--destructive-foreground-rgb) / <alpha-value>)',
                input: 'rgb(var(--input-rgb) / <alpha-value>)',
                ring: 'rgb(var(--ring-rgb) / <alpha-value>)',

                /* optional aliases (safe to keep for readability) */
                ink: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
                gold: 'rgb(var(--color-accent-rgb) / <alpha-value>)',
                porcelain: 'rgb(var(--color-bg-rgb) / <alpha-value>)',
                borderSoft: 'rgb(var(--border-color-rgb) / <alpha-value>)',
                footer: 'rgb(17 18 20 / <alpha-value>)',
            },
            spacing: {
                'space-1': 'var(--space-1)',
                'space-2': 'var(--space-2)',
                'space-3': 'var(--space-3)',
                'space-4': 'var(--space-4)',
                'space-6': 'var(--space-6)',
                'space-8': 'var(--space-8)',
                'space-12': 'var(--space-12)',
                'space-16': 'var(--space-16)',
                'section-y': 'var(--section-y)',
                'section-y-lg': 'var(--section-y-lg)',
                section: 'var(--section-y)',
                'section-lg': 'var(--section-y-lg)',
            },
            maxWidth: {
                'container-sm': 'var(--container-sm)',
                'container-md': 'var(--container-md)',
                'container-lg': 'var(--container-lg)',
                'container-xl': 'var(--container-xl)',
            },
            borderRadius: {
                sm: '6px',
                md: '12px',
                lg: '20px',
            },
            boxShadow: {
                soft: '0 10px 30px rgba(0,0,0,0.08)',
            },
        },
    },
    plugins: [
        require('./lib/radix-focus-plugin.js'),
        require('tailwindcss/plugin')(function ({ addUtilities }) {
            addUtilities({
                '.radix-focus': {
                    '@apply outline-none ring-2 ring-offset-2 ring-offset-background ring-primary':
                        {},
                },
            });
        }),
    ],
};
