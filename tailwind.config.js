/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f0f5f0',
          100: '#dcebdc',
          200: '#bdd9bd',
          300: '#9fc79f',
          400: '#8fbc8f',
          500: '#6fa86f',
          600: '#5a8a5a',
          700: '#476c47',
          800: '#3a573a',
          900: '#2f472f',
        },
        coral: {
          50: '#fef5f5',
          100: '#fde8e8',
          200: '#fcd0d0',
          300: '#f9a8a8',
          400: '#f08080',
          500: '#e55c5c',
          600: '#cc4444',
          700: '#ab3636',
          800: '#8d2e2e',
          900: '#752a2a',
        },
        cream: '#fffaf0',
        charcoal: '#2f2f2f',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
