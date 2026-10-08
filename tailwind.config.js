/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        // Connect Dhaba brand palette
        // 🍷 Deep Maroon — primary brand, active states, primary buttons
        maroon: {
          50:  '#f9eded',
          100: '#f0d0d0',
          200: '#e0a1a1',
          300: '#cc6c6c',
          400: '#b83d3d',
          500: '#9a2529',
          600: '#7A1E23',   // brand primary
          700: '#661920',
          800: '#521519',
          900: '#3e1014',
        },
        // 🥇 Warm Gold — borders, icons, decorative
        gold: {
          50:  '#fdf8ee',
          100: '#f9efd1',
          200: '#f3dea3',
          300: '#ecc86a',
          400: '#D4AF6B',   // brand gold
          500: '#c49a4a',
          600: '#a87d32',
          700: '#865f22',
          800: '#654616',
          900: '#43300e',
        },
        // 🤍 Warm Cream — light backgrounds, light text on dark
        cream: {
          50:  '#fffdf9',
          100: '#fdf6ec',
          200: '#F7EAD6',   // brand cream
          300: '#efd5b5',
          400: '#e0bc8e',
          500: '#cfa06a',
          600: '#b5834a',
        },
        // 🤎 Earthy Brown — secondary elements
        brown: {
          400: '#a87a56',
          500: '#8B5E3C',   // brand brown
          600: '#744e31',
          700: '#5e3e27',
        },
        // 🧡 Accent Orange — highlights
        accent: {
          400: '#d9703f',
          500: '#C3542E',   // brand accent
          600: '#a8461f',
          700: '#8b3918',
        },
        // 🖤 Charcoal — sidebar bg, primary text base
        charcoal: {
          50:  '#f5f4f3',
          100: '#ebe9e7',
          200: '#d5d1ce',
          300: '#b9b4af',
          400: '#8f8880',
          500: '#6b6461',
          600: '#524e4b',
          700: '#3d3a38',
          800: '#282623',   // brand charcoal
          900: '#1a1917',
        },
        // Neutral ink — general text and UI
        ink: {
          50:  '#f8f6f3',
          100: '#ede9e3',
          200: '#dcd6cd',
          300: '#c2b9ac',
          400: '#9e9286',
          500: '#7e7267',
          600: '#655a51',
          700: '#4d453e',
          800: '#38312c',
          900: '#282623',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(40,38,35,0.04), 0 1px 3px rgba(40,38,35,0.06)',
        pop:  '0 12px 32px -8px rgba(40,38,35,0.20), 0 2px 6px rgba(40,38,35,0.06)',
        gold: '0 0 0 2px #D4AF6B40',
      },
      borderRadius: {
        xl:  '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [],
};
