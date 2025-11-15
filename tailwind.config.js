/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '360px',
      },
      colors: {
        // Classic Light Mode Palette
        light: {
          bg: {
            primary: '#FFFFFF',     // Blanco puro
            secondary: '#F5F5F0',   // Beige muy claro
            tertiary: '#FAF8F3',    // Crema suave
            card: '#FEFEFE',        // Blanco card
          },
          text: {
            primary: '#1A1A1A',     // Negro suave
            secondary: '#4A4A4A',   // Gris medio
            tertiary: '#6B6B6B',    // Gris claro
          },
          border: {
            primary: '#E5E5E0',     // Border beige
            secondary: '#D4D4CE',   // Border más oscuro
          },
          shadow: {
            sm: 'rgba(0, 0, 0, 0.05)',
            md: 'rgba(0, 0, 0, 0.08)',
            lg: 'rgba(0, 0, 0, 0.12)',
          },
        },
        // Classic Dark Mode Palette
        dark: {
          bg: {
            primary: '#0A0A0A',     // Negro profundo
            secondary: '#151515',   // Gris muy oscuro
            tertiary: '#1E1E1E',    // Gris oscuro
            card: '#1A1A1A',        // Card oscuro
          },
          text: {
            primary: '#F5F5F5',     // Blanco suave
            secondary: '#B8B8B8',   // Gris claro
            tertiary: '#8A8A8A',    // Gris medio
          },
          border: {
            primary: '#2A2A2A',     // Border oscuro
            secondary: '#353535',   // Border más claro
          },
          shadow: {
            sm: 'rgba(255, 255, 255, 0.03)',
            md: 'rgba(255, 255, 255, 0.05)',
            lg: 'rgba(255, 255, 255, 0.08)',
          },
        },
        // Accent colors (subtle & professional)
        accent: {
          primary: '#4A90E2',      // Azul profesional
          secondary: '#6B7280',    // Gris neutro
          success: '#10B981',      // Verde éxito
          warning: '#F59E0B',      // Amarillo warning
          error: '#EF4444',        // Rojo error
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
      },
      borderRadius: {
        'sm': '0.375rem',  // 6px
        'DEFAULT': '0.5rem',  // 8px
        'md': '0.625rem',  // 10px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.25rem',  // 20px
      },
      boxShadow: {
        // Sombras suaves y profesionales
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 2px 4px 0 rgba(0, 0, 0, 0.08)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        // Dark mode shadows
        'dark-sm': '0 1px 2px 0 rgba(255, 255, 255, 0.03)',
        'dark': '0 2px 4px 0 rgba(255, 255, 255, 0.05)',
        'dark-md': '0 4px 6px -1px rgba(255, 255, 255, 0.05), 0 2px 4px -1px rgba(255, 255, 255, 0.03)',
        'dark-lg': '0 10px 15px -3px rgba(255, 255, 255, 0.08), 0 4px 6px -2px rgba(255, 255, 255, 0.04)',
        'dark-xl': '0 20px 25px -5px rgba(255, 255, 255, 0.1), 0 10px 10px -5px rgba(255, 255, 255, 0.05)',
      },
      keyframes: {
        // Animaciones minimalistas y suaves
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-in-up': 'fadeInUp 0.4s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
      },
      transitionDuration: {
        '50': '50ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
