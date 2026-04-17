import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        iguape: {
          50: '#f4f7fb',
          100: '#dde7f4',
          200: '#c0d2eb',
          300: '#94b7db',
          400: '#66a2d4',
          500: '#2996cc',
          600: '#3a5ea6',
          700: '#325497',
          800: '#29457d',
          900: '#20355f',
        },
      },
      fontFamily: {
        sans: ['"Montserrat"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 40px -28px rgba(43, 76, 133, 0.28)',
        panel: '0 28px 70px -40px rgba(29, 49, 90, 0.42)',
      },
    },
  },
  plugins: [],
} satisfies Config;
