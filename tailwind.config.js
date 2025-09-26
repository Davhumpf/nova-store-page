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
      // opcional: tipografías, sombras, etc.
    },
  },
  safelist: [
    // si generas clases dinámicas por string, añádelas aquí para evitar purgado
    'from-primary', 'to-primary-light', 'bg-accent', 'text-accent'
  ],
  plugins: [],
};
