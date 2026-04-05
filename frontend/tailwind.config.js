/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0C10',
        card: '#1F2833',
        primary: '#45A29E',
        highlight: '#66FCF1',
        text: '#C5C6C7',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(102,252,241,0.25), 0 10px 30px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}

