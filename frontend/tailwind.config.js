/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', '"DM Serif Display"', 'Georgia', 'serif'],
        display: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Heritage Banking Colors
        forest: {
          DEFAULT: '#183D32',
          light: '#214B3C',
          deep: '#102C25',
          darkest: '#0A1C17',
          50: '#F3F7F5',
          100: '#E2ECE7',
          200: '#C5D8CF',
          300: '#9DBEB0',
          400: '#6FA08C',
          500: '#214B3C',
          600: '#183D32',
          700: '#14332A',
          800: '#102C25',
          900: '#0B1E19',
        },
        ivory: {
          DEFAULT: '#F7F0E5',
          light: '#FDFBF7',
          cream: '#EFE5D5',
          dark: '#E2D5C0',
        },
        terracotta: {
          DEFAULT: '#B65F3C',
          light: '#C88762',
          hover: '#9E4E2E',
          dark: '#873F23',
          subtle: '#F7ECE7',
        },
        copper: {
          DEFAULT: '#C88762',
          light: '#DFC1B1',
          dark: '#A86844',
        },
        heritage: {
          dark: '#25251F',
          secondary: '#777267',
          muted: '#A59F93',
          border: '#E4D8C7',
          'border-light': '#EFE5D5',
          paper: '#FDFBF7',
          surface: '#F8F3EA',
        },
        // Functional Status Colors
        status: {
          success: '#557C4D',
          'success-bg': '#F1F6F0',
          'success-border': '#CBE0C7',
          warning: '#C58B35',
          'warning-bg': '#FCF6EC',
          'warning-border': '#F3DDAC',
          danger: '#A94438',
          'danger-bg': '#FDF2F0',
          'danger-border': '#F0C2BE',
        },
      },
      boxShadow: {
        'heritage-sm': '0 1px 2px 0 rgba(37, 37, 31, 0.04)',
        'heritage': '0 4px 12px 0 rgba(37, 37, 31, 0.06), 0 1px 2px 0 rgba(37, 37, 31, 0.04)',
        'heritage-lg': '0 10px 25px -3px rgba(37, 37, 31, 0.08), 0 4px 6px -2px rgba(37, 37, 31, 0.03)',
        'heritage-card': '0 12px 30px -5px rgba(16, 44, 37, 0.25)',
      },
      backgroundImage: {
        'paper-pattern': "radial-gradient(#E4D8C7 0.75px, transparent 0.75px)",
      },
    },
  },
  plugins: [],
}
