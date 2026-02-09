export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#FBF9F6',
          100: '#F5EFE6',
          200: '#E7DCCB',
          300: '#D8C6B2',
        },
        ocean: {
          600: '#1E4E5E',
          700: '#153D49',
          800: '#0E2B33',
        },
        sun: {
          500: '#C7A17A',
          600: '#B28A63',
        },
      },
      boxShadow: {
        soft: '0 30px 80px rgba(14, 43, 51, 0.18)',
        glow: '0 22px 60px rgba(30, 78, 94, 0.2)',
      },
      letterSpacing: {
        luxe: '0.2em',
      },
    },
  },
  plugins: [],
}
