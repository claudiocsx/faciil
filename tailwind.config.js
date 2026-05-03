/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores Neon da Identidade FaCiil Tech
        'faciil-dark': '#050505',
        'faciil-cyan': '#22d3ee',
        'faciil-lime': '#bef264',
      },
      borderRadius: {
        'faciil': '2.5rem',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #22d3ee 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}