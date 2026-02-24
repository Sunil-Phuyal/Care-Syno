/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#F0FAF7',
          100: '#D1F5EC',
          200: '#A3EBD9',
          300: '#5EDDC0',
          400: '#2DD4AA',
          500: '#2DD4AA',
          600: '#1FB896',
          700: '#178A72',
          800: '#115E52',
          900: '#0A3830',
          950: '#061f1a',
        },

        // True black grays — like Vercel/GitHub dark mode
        // Pure blacks and near-blacks with no color tint
        // Strong contrast between each layer
        gray: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d1d5db',
          400: '#a1a1aa',   // ← muted text
          500: '#71717a',   // ← secondary text
          600: '#52525b',   // ← medium text
          700: '#27272a',   // ← inputs, borders
          800: '#1c1c1f',   // ← cards (visibly lighter than bg)
          900: '#09090b',   // ← main background
          950: '#000000',   // ← sidebar (pure black)
        },

        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        xs:    ['0.75rem',  { lineHeight: '1rem' }],
        sm:    ['0.875rem', { lineHeight: '1.25rem' }],
        base:  ['1rem',     { lineHeight: '1.5rem' }],
        lg:    ['1.125rem', { lineHeight: '1.75rem' }],
        xl:    ['1.25rem',  { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        lg:    '0.5rem',
        xl:    '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        sm:      '0 1px 2px 0 rgb(0 0 0 / 0.3)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        md:      '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
        lg:      '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
      },
      keyframes: {
        'fade-in':        { '0%': { opacity: '0', transform: 'translateY(8px)' },   '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(16px)' },  '100%': { opacity: '1', transform: 'translateX(0)' } },
        'slide-in-left':  { '0%': { opacity: '0', transform: 'translateX(-16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'slide-in-down':  { '0%': { opacity: '0', transform: 'translateY(-8px)' },  '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        'fade-in':        'fade-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.25s ease-out',
        'slide-in-left':  'slide-in-left 0.25s ease-out',
        'slide-in-down':  'slide-in-down 0.2s ease-out',
      },
    },
  },
  plugins: [],
};