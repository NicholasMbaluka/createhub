/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f9ff',
          100: '#f1f3ff',
          200: '#e5e8ff',
          300: '#d1d6ff',
          400: '#b8c0ff',
          500: '#9ca5ff',
          600: '#7c6ff7',
          700: '#5b4fe0',
          800: '#4a3fc7',
          900: '#3f35a6',
          950: '#2e2456',
        },
        dark: {
          DEFAULT: '#08080e',
          50: '#f8f8f9',
          100: '#f1f1f3',
          200: '#e3e3e6',
          300: '#d1d1d7',
          400: '#b8b8c3',
          500: '#9b9bae',
          600: '#7d7d94',
          700: '#636377',
          800: '#4e4e5f',
          900: '#3e3e4e',
          950: '#1e1e2e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #08080e 0%, #1e1e2e 50%, #3e3e4e 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(124, 111, 247, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(124, 111, 247, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
