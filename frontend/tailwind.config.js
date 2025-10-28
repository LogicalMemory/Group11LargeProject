/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF7A18',
          red: '#FF2D55',
          purple: '#7B2FFF',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #FF7A18 0%, #FF2D55 50%, #7B2FFF 100%)',
      },
      boxShadow: {
        brand: '0 20px 45px -20px rgba(123, 47, 255, 0.35)',
      },
    },
  },
  plugins: [],
};
