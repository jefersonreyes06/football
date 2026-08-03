/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00ffff',
          magenta: '#ff00ff',
          green: '#00ff66',
          orange: '#ff6600',
        }
      }
    },
  },
  plugins: [],
}
