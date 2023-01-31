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
    extend: {},
  },
  plugins: [],
};
