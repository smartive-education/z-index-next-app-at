/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require("@smartive-education/design-system-component-z-index/tailwind")
  ],
  content: [
    "./node_modules/@smartive-education/design-system-component-z-index/dist/**/*.js",
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        skeleton: {
          '0%': {
            backgroundImage: 'linear-gradient(to right, #94a3b8 , #cbd5e1, #cbd5e1)'
          },
          '50%': {
            backgroundImage: 'linear-gradient(to right, #cbd5e1 , #94a3b8, #cbd5e1)'
          },
          '100%': {
            backgroundImage: 'linear-gradient(to right, #cbd5e1 , #cbd5e1, #94a3b8)'
          }
        }
      },
      animation: {
        skeleton: 'skeleton 0.75s linear infinite',
      }
    },
  },
  plugins: [],
};
