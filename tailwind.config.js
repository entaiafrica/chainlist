const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        primary: {
          DEFAULT: '#6A45FF', // A vibrant purple
          light: '#8C6DFF',
          dark: '#5B3ACC',
        },
        gray: {
          100: '#F7F7F7', // Lightest Gray
          200: '#E5E5E5', // Light Gray
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373', // Medium Gray
          600: '#525252',
          700: '#404040',
          800: '#262626', // Dark Gray
          900: '#171717', // Darkest Gray
        },
      },
      // Apple-inspired typography scale
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px - Minimum size
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px - Body
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px - Card titles
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Section headers
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - Large values
        '5xl': ['3rem', { lineHeight: '1.2' }],         // 48px - Hero
        '6xl': ['3.75rem', { lineHeight: '1.1' }],      // 60px
        '7xl': ['4.5rem', { lineHeight: '1.1' }],       // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
      },
      fontWeight: {
        normal: '400',
        medium: '500',   // Body emphasis
        semibold: '600', // Headings
        bold: '700',     // Important values
        black: '900',    // Primary values
      },
      // Enhanced spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      // Border radius scale
      borderRadius: {
        '4xl': '2rem',
      },
      // Box shadows
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'strong': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      keyframes: {
        carousel: {
          '0%, 30%': { transform: 'translateX(0)' },
          '33%, 63%': { transform: 'translateX(-100%)' },
          '66%, 100%': { transform: 'translateX(-200%)' },
        },
        'carousel-smooth': {
          '0%, 28%': { transform: 'translateX(0)' },
          '33%, 61%': { transform: 'translateX(-33.333%)' },
          '66%, 94%': { transform: 'translateX(-66.666%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
            boxShadow: '0 25px 50px -12px rgba(147, 51, 234, 0.25)',
          },
          '50%': {
            transform: 'translateY(-20px)',
            boxShadow: '0 35px 60px -15px rgba(147, 51, 234, 0.4)',
          },
        },
        'brick-stack': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '50%': {
            transform: 'translateY(-5px)',
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'brick-pulse': {
          '0%, 100%': {
            opacity: '0.4',
            transform: 'scale(0.95)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      animation: {
        carousel: 'carousel 12s infinite ease-in-out',
        'carousel-smooth': 'carousel-smooth 15s infinite ease-in-out',
        float: 'float 6s ease-in-out infinite',
        'brick-stack': 'brick-stack 0.6s ease-out forwards',
        'brick-pulse': 'brick-pulse 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
