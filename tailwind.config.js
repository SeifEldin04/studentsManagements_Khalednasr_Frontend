/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        quicksand: ["Quicksand", "sans-serif"],
      },
      colors: {
        // primary: '#FE7743',
        primary: 'OKLAB(0.685 -0.0912435 -0.142252 / 0.75)',
        // secondary: '#DF9755',
        secondary:'OKLAB(0.685 -0.0912435 -0.142252 / 0.9)',
        thirdly: '#E7D283'
      },

      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem'
        }
      },
    },
  },
  plugins: [],
  darkMode: "class",
}