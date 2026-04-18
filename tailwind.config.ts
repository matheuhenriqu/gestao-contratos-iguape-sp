import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          950: 'var(--color-primary-950)',
          900: 'var(--color-primary-900)',
          800: 'var(--color-primary-800)',
          700: 'var(--color-primary-700)',
          600: 'var(--color-primary-600)',
          500: 'var(--color-primary-500)',
          200: 'var(--color-primary-200)',
          100: 'var(--color-primary-100)',
          50: 'var(--color-primary-50)',
        },
        secondary: {
          700: 'var(--color-secondary-700)',
          600: 'var(--color-secondary-600)',
          500: 'var(--color-secondary-500)',
        },
        accent: {
          700: 'var(--color-accent-700)',
          600: 'var(--color-accent-600)',
          500: 'var(--color-accent-500)',
        },
        bg: {
          DEFAULT: 'var(--color-bg)',
          accent: 'var(--color-bg-accent)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
          divider: 'var(--color-divider)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          subtle: 'var(--color-text-subtle)',
          inverse: 'var(--color-text-inverse)',
          onPrimary: 'var(--color-text-on-primary)',
        },
        status: {
          critical: 'var(--color-status-critico)',
          criticalBg: 'var(--color-status-critico-bg)',
          warning: 'var(--color-status-atencao)',
          warningBg: 'var(--color-status-atencao-bg)',
          ok: 'var(--color-status-ok)',
          okBg: 'var(--color-status-ok-bg)',
          neutral: 'var(--color-status-neutro)',
          neutralBg: 'var(--color-status-neutro-bg)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['11px', { lineHeight: '16px' }],
        sm: ['12px', { lineHeight: '18px' }],
        base: ['14px', { lineHeight: '20px' }],
        md: ['15px', { lineHeight: '22px' }],
        lg: ['16px', { lineHeight: '24px' }],
        xl: ['18px', { lineHeight: '26px' }],
        '2xl': ['22px', { lineHeight: '30px' }],
        '3xl': ['28px', { lineHeight: '34px' }],
      },
      maxWidth: {
        content: '1400px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        raised: 'var(--shadow-raised)',
        elevated: 'var(--shadow-elevated)',
        drawer: 'var(--shadow-drawer)',
        header: 'var(--shadow-header)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        pill: 'var(--radius-pill)',
      },
    },
  },
  plugins: [],
} satisfies Config;
