import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                background: 'rgb(var(--color-background) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                'surface-hover': 'rgb(var(--color-surface-hover) / <alpha-value>)',
                foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
                muted: 'rgb(var(--color-muted) / <alpha-value>)',
                faint: 'rgb(var(--color-faint) / <alpha-value>)',
                edge: 'rgb(var(--color-edge) / <alpha-value>)',
                card: 'rgb(var(--color-surface) / <alpha-value>)',
                accent: '#5D1B1D',
                accentSoft: '#8B3436',
            },
            boxShadow: {
                'soft-glow': '0 0 40px rgb(var(--color-glow) / 0.25)',
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms, typography],
};
