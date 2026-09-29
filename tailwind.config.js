/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#fbf8f2',
          150: '#f8f4ec',
          200: '#f5efe4',
          300: '#ede3d3',
          400: '#dfd0b8',
          500: '#c5af8e',
          600: '#9f8563',
          700: '#796345',
          800: '#4a3d2c',
          900: '#2b241a',
          950: '#1c1710',
        },
        navy: {
          50: '#fbf8f2',
          100: '#f5efe4',
          200: '#ede3d3',
          300: '#dfd0b8',
          400: '#c5af8e',
          500: '#0f4c42',
          600: '#0c3c34',
          700: '#092d27',
          800: '#2b241a',
          900: '#1c1710',
          950: '#0f0c08',
        },
        bdgreen: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#064e3b',
          900: '#033327',
        }
      }
    },

  },
  plugins: [],
}
