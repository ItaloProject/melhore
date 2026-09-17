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
        // Melhore brand — âmbar-dourado
        brand: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Surface tokens — charcoal quente
        surface: {
          900: '#100D09',
          800: '#18140F',
          700: '#201A13',
          600: '#2C2419',
        },
        // Background extra-escuro quente
        warm: {
          950: '#0C0A07',
          900: '#131009',
        },
      },
      fontFamily: {
        sans:  ['var(--font-inter)',     'system-ui', 'sans-serif'],
        serif: ['var(--font-dm-serif)',  'Georgia',   'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-brand': `
          radial-gradient(at 27% 37%, hsla(38,95%,58%,0.10) 0px, transparent 50%),
          radial-gradient(at 95% 20%, hsla(25,95%,65%,0.08) 0px, transparent 50%),
          radial-gradient(at 52% 99%, hsla(45,95%,55%,0.09) 0px, transparent 50%),
          radial-gradient(at 10% 29%, hsla(30,90%,50%,0.06) 0px, transparent 50%)
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
