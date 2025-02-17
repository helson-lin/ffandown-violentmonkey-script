/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.vue"],
  theme: {
    screens: {},
    extend: {
      keyframes: {}
    },
  },
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
}

