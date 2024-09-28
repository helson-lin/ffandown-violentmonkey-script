/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.vue"],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          '0%': { top: '-3rem' },
          '100%': { top:   '2rem'},
        }
      }
    },
  },
  plugins: [],
}

