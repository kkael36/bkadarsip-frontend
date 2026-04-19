/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warna biru khas instansi pemerintahan
        'bkad-blue': '#1e3a8a', 
        'bkad-light': '#f8fafc',
      }
    },
  },
  plugins: [],
}