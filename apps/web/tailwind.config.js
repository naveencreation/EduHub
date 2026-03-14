/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
          light: '#eef2ff',
        },
        secondary: '#0ea5e9',
        accent: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / .06), 0 1px 2px -1px rgb(0 0 0 / .06)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / .08), 0 2px 4px -2px rgb(0 0 0 / .06)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
