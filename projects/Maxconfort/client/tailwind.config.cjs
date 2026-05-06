const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        '../../../packages/ui/src/**/*.{js,ts,jsx,tsx,scss}',
        './node_modules/@radix-ui/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-nexa)', 'system-ui', 'sans-serif'],
                body: ['var(--font-nexa)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
                display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
                ui: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
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
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'bounce-light': 'bounceLight 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                bounceLight: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
            },
        },
    },
    plugins: [require('./lib/radix-focus-plugin.js')],
};
