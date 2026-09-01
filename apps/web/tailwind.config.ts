import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Melhore brand — violet
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Surface tokens (dark sidebar)
        surface: {
          900: '#0f0f14',
          800: '#17171f',
          700: '#1e1e2a',
          600: '#2a2a38',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-brand': `
          radial-gradient(at 27% 37%, hsla(215,98%,61%,0.12) 0px, transparent 50%),
          radial-gradient(at 97% 21%, hsla(270,98%,72%,0.10) 0px, transparent 50%),
          radial-gradient(at 52% 99%, hsla(250,98%,60%,0.12) 0px, transparent 50%),
          radial-gradient(at 10% 29%, hsla(300,98%,60%,0.08) 0px, transparent 50%)
        `,
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
