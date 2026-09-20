/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e0ebf6',
          200: '#c0d4ec',
          300: '#94b6de',
          400: '#5c90cb',
          500: '#3470b5',
          600: '#235698',
          700: '#1b4378',
          800: '#132f54',
          900: '#0a192f',
          950: '#050d1a',
        },
        bdgreen: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      }
    },

  },
  plugins: [],
}
