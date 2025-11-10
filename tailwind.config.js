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
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-in-out',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideDown: 'slideDown 0.3s ease-out',
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
