/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"DM Sans"', 'sans-serif']
      },
      colors: {
        navy: '#0f172a',
        accent: '#4f46e5'
      }
    }
  },
  plugins: []
}
