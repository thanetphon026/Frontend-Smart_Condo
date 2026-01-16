/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'sans-serif'],
      },
      colors: {
        primary: '#1e40af',
        primaryHover: '#1e3a8a',
        secondary: '#1d4ed8',
        'custom-bg': '#f1f5f9'
      }
    }
  },
  plugins: [],
}