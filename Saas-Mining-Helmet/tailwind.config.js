/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "safe-green": "#22c55e",
        "warning-orange": "#f97316",
        "danger-red": "#ef4444",
      },
    },
  },
  plugins: [],
}
