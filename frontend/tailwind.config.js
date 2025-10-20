/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dna-blue': '#1e3a8a',
        'dna-green': '#059669',
        'dna-purple': '#7c3aed',
        'dna-orange': '#ea580c',
      },
    },
  },
  plugins: [],
}
