/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F6E56',
        secondary: '#534AB7',
        accent: '#854F0B',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
