/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gallery: {
          bg: '#FAF8F5',
          card: '#F4F0E8',
          border: '#E8E2D8',
          dark: '#181716',
          surface: '#FFFFFF',
          muted: '#6E6A66',
          gold: {
            DEFAULT: '#C5A059',
            light: '#E5D1A6',
            dark: '#9E7B3B',
          },
          sold: '#8C3A3A',
          available: '#2E6B48',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'gallery': '0 10px 30px -10px rgba(24, 23, 22, 0.08)',
        'gallery-lg': '0 20px 40px -15px rgba(24, 23, 22, 0.12)',
        'gold-glow': '0 0 20px rgba(197, 160, 89, 0.25)',
      },
    },
  },
  plugins: [],
}
