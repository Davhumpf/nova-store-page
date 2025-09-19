/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 🎨 Base morado oscuro (marca premium)
        primary: {
          DEFAULT: '#4B0082', // Morado oscuro principal
          dark: '#2E004E',    // Más intenso para hover
          light: '#7C3AED',   // Morado claro para fondos secundarios
        },
        // 🎨 Acentos en amarillo (acciones, precios, botones)
        accent: {
          DEFAULT: '#FFD600', // Amarillo vibrante
          dark: '#E6C200',    // Versión más sobria
          light: '#FFEA70',   // Amarillo suave
        },
        // 🎨 Blanco y grises claros para texto y fondos
        neutral: {
          DEFAULT: '#F5F5F5', // Gris muy claro
          dark: '#1F1B24',    // Fondo oscuro (cards, modales)
          mid: '#B0B0B0',     // Texto secundario
        },
      },
    },
  },
  plugins: [],
};
