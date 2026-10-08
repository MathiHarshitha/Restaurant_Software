/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        // Brand: deep ink navy for chrome, blue for primary actions & data
        ink: {
          50: '#f6f6f3',
          100: '#eeede8',
          200: '#e1e0d9',
          300: '#c3c2b7',
          400: '#898781',
          500: '#6b6a65',
          600: '#52514e',
          700: '#3a3936',
          800: '#232321',
          900: '#141413',
        },
        brand: {
          50: '#eef5fd',
          100: '#cde2fb',
          200: '#9ec5f4',
          400: '#3987e5',
          500: '#2a78d6',
          600: '#256abf',
          700: '#1c5cab',
          800: '#184f95',
          900: '#14213d',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,20,19,0.04), 0 1px 3px rgba(20,20,19,0.06)',
        pop: '0 12px 32px -8px rgba(20,20,19,0.18), 0 2px 6px rgba(20,20,19,0.06)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [],
};
