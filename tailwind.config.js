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
        // Pastel Purple Theme - Light Mode
        light: {
          bg: {
            primary: '#FAF8FF',
            secondary: '#F5F3FF',
            tertiary: '#EDE9FE',
            card: '#FFFFFF',
          },
          text: {
            primary: '#1A0A2E',
            secondary: '#4A3F5C',
            tertiary: '#6E6780',
          },
          border: {
            primary: '#E9E4F0',
            secondary: '#D6CBEA',
          },
        },
        // Electric Purple Theme - Dark Mode
        dark: {
          bg: {
            primary: '#0F0A1F',
            secondary: '#1A1330',
            tertiary: '#251C3F',
            card: '#1A1330',
          },
          text: {
            primary: '#F5F3FF',
            secondary: '#C4B5FD',
            tertiary: '#9588B8',
          },
          border: {
            primary: '#2D2050',
            secondary: '#3D2F65',
          },
        },
        // Accent colors
        accent: {
          primary: '#7C3AED',
          secondary: '#A78BFA',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        },
        // Stock indicators
        stock: {
          available: '#3B82F6',
          unavailable: '#6B7280',
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
        'sm': '0.5rem',    // 8px
        'DEFAULT': '0.75rem',  // 12px
        'md': '0.75rem',   // 12px
        'lg': '1rem',      // 16px
        'xl': '1.25rem',   // 20px
        '2xl': '1.5rem',   // 24px
      },
      boxShadow: {
        // Claude.ai Style - Subtle shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 2px 6px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'xl': '0 8px 20px -4px rgba(0, 0, 0, 0.1)',
        'inner': 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'none': 'none',
      },
      keyframes: {
        // Claude.ai Style - Minimal animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.15s ease-out',
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
