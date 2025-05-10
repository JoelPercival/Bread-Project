/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bread: {
          crust: '#8B4513',
          crumb: '#F5DEB3',
          flour: '#F5F5DC',
          wheat: '#D2B48C',
          cream: '#FFFDD0',
          brown: {
            100: '#F5EFDC',
            200: '#E6D5A7',
            300: '#D4BA78',
            400: '#C2A256',
            500: '#A08446',
            600: '#7D6534',
            700: '#5A4722',
            800: '#3C2E18',
            900: '#1E180C',
          },
        },
        success: {
          100: '#DCFCE7',
          500: '#22C55E',
          900: '#14532D',
        },
        warning: {
          100: '#FEF9C3',
          500: '#EAB308',
          900: '#713F12',
        },
        error: {
          100: '#FEE2E2',
          500: '#EF4444',
          900: '#7F1D1D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};