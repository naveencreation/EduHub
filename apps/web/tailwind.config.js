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
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#ecfdf5',
        },
        secondary: '#64748b',
        accent: '#F97316',
        'brand': {
          emerald: '#10B981',
          coral: '#F97316',
          slate: '#374151',
          'light-bg': '#F3F4F6',
          dark: '#1F2937',
        },
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
