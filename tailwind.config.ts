import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: 'var(--color-primary-900)',
          700: 'var(--color-primary-700)',
          600: 'var(--color-primary-600)',
          100: 'var(--color-primary-100)',
        },
        secondary: {
          600: 'var(--color-secondary-600)',
        },
        accent: {
          600: 'var(--color-accent-600)',
        },
        surface: 'var(--color-surface)',
        surface2: 'var(--color-surface-2)',
        border: 'var(--color-border)',
        borderStrong: 'var(--color-border-strong)',
        text: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        subtle: 'var(--color-text-subtle)',
        status: {
          critico: 'var(--color-status-critico)',
          atencao: 'var(--color-status-atencao)',
          ok: 'var(--color-status-ok)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        raised: 'var(--shadow-raised)',
      },
    },
  },
  plugins: [],
} satisfies Config;
