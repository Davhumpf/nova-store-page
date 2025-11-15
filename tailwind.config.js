/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // opcional si luego quieres toggle de tema
  theme: {
    extend: {
      screens: {
        xs: '360px', // muy útil para mobile chico
      },
      colors: {
        primary: {
          DEFAULT: '#4B0082',
          dark: '#2E004E',
          light: '#7C3AED',
        },
        accent: {
          DEFAULT: '#FFD600',
          dark: '#E6C200',
          light: '#FFEA70',
        },
        neutral: {
          DEFAULT: '#F5F5F5',
          dark: '#1F1B24',
          mid: '#B0B0B0',
        },
        // Pop Art / Comic Book Colors
        pop: {
          red: '#FF3B3B',
          'red-dark': '#FF5757',
          blue: '#0066FF',
          'blue-dark': '#4D9FFF',
          yellow: '#FFD600',
          'yellow-dark': '#FFE34D',
          pink: '#FF6AC1',
          'pink-dark': '#FF87D4',
          cyan: '#00D9FF',
          'cyan-dark': '#4DFFFF',
          orange: '#FF8C00',
          'orange-dark': '#FFB04D',
          purple: '#9B5DE5',
          'purple-dark': '#B794F6',
          green: '#00F5A0',
          'green-dark': '#4DFFB8',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        comicPop: {
          '0%': { transform: 'scale(0.8) rotate(-2deg)', opacity: '0' },
          '50%': { transform: 'scale(1.05) rotate(1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        comicBounce: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '25%': { transform: 'translateY(-8px) scale(1.02, 0.98)' },
          '50%': { transform: 'translateY(0) scale(0.98, 1.02)' },
          '75%': { transform: 'translateY(-4px) scale(1.01, 0.99)' },
        },
        speedLines: {
          '0%': { transform: 'translateX(100%) skewX(-20deg)', opacity: '0' },
          '50%': { opacity: '0.6' },
          '100%': { transform: 'translateX(-100%) skewX(-20deg)', opacity: '0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out',
        'comic-pop': 'comicPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'comic-bounce': 'comicBounce 0.6s ease-in-out',
        'speed-lines': 'speedLines 1.5s ease-in-out infinite',
      },
      // opcional: tipografías, sombras, etc.
    },
  },
  safelist: [
    // si generas clases dinámicas por string, añádelas aquí para evitar purgado
    'from-primary', 'to-primary-light', 'bg-accent', 'text-accent'
  ],
  plugins: [],
};
