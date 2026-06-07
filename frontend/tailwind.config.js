/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2d6a4f',
        'primary-light': '#52b788',
        'primary-accent': '#95d5b2',
        'primary-pale': '#d8f3dc',
      },
    },
  },
  plugins: [],
}
