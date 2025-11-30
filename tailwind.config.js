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
        // Claude-inspired Neutral Palette
        light: {
          bg: {
            primary: '#FAFAFA',    // Main background
            secondary: '#FFFFFF',  // Cards, inputs
            tertiary: '#F5F5F5',   // Subtle backgrounds
            hover: '#F0F0F0',      // Hover states
          },
          text: {
            primary: '#1A1A1A',    // Main text
            secondary: '#6B7280',  // Secondary text
            tertiary: '#9CA3AF',   // Muted text
            inverse: '#FFFFFF',    // Text on dark backgrounds
          },
          border: {
            primary: '#E5E5E5',    // Main borders
            secondary: '#D1D5DB',  // Subtle borders
            focus: '#9CA3AF',      // Focus ring
          },
          accent: {
            primary: '#E17B5B',    // Claude's coral/salmon accent
            secondary: '#F59E82',  // Lighter accent
            hover: '#D66A4A',      // Darker accent on hover
          },
        },
        // Claude-inspired Dark Mode
        dark: {
          bg: {
            primary: '#1A1A1A',    // Main background
            secondary: '#2A2A2A',  // Cards, elevated surfaces
            tertiary: '#333333',   // Subtle backgrounds
            hover: '#3A3A3A',      // Hover states
          },
          text: {
            primary: '#FFFFFF',    // Main text
            secondary: '#B4B4B4',  // Secondary text
            tertiary: '#8A8A8A',   // Muted text
            inverse: '#1A1A1A',    // Text on light backgrounds
          },
          border: {
            primary: '#3A3A3A',    // Main borders
            secondary: '#4A4A4A',  // Subtle borders
            focus: '#6A6A6A',      // Focus ring
          },
          accent: {
            primary: '#E17B5B',    // Same coral/salmon
            secondary: '#F59E82',  // Lighter accent
            hover: '#D66A4A',      // Darker on hover
          },
        },
      },
      borderRadius: {
        'card': '12px',        // Cards like Claude
        'input': '10px',       // Inputs/buttons
        'badge': '6px',        // Small badges
        'pill': '999px',       // Fully rounded
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'input': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      spacing: {
        'card': '16px',       // Card padding
        'section': '24px',    // Section spacing
      },
    },
  },
  plugins: [],
};
