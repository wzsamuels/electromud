/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "darkBackground": "#181818",
        "background": "#F0F0F0",
        "darkText": "#E0E0E0",
        "text": "#2E2E2E"
      }
    },
  },
  plugins: [],
}

