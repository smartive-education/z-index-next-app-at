/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [
    require('@smartive-education/design-system-component-z-index-at/tailwind'),
  ],
  content: [
    './node_modules/@smartive-education/design-system-component-z-index-at/dist/**/*.js',
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {},
  plugins: [],
};
