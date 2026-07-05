/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Peachtree Road Race red
        peachtree: {
          50:  '#fef2f2',
          100: '#fde1e2',
          200: '#fcc5c7',
          300: '#f99da0',
          400: '#f26468',
          500: '#cb333b',
          600: '#a82830',
          700: '#891f26',
          800: '#6d1a1f',
          900: '#5c1a1e',
          950: '#2e080a',
        },
        // July 4th navy
        navy: {
          50:  '#eff4ff',
          100: '#dce8ff',
          200: '#bed3ff',
          300: '#91b3fd',
          400: '#5e87f8',
          500: '#3761f1',
          600: '#2143e6',
          700: '#1a33cb',
          800: '#1c2ca3',
          900: '#1c2c7e',
          950: '#111c4a',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

