/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.jsx",
    "./components/**/*.{js,jsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Professional Colors (V2)
        'brand': {
          'primary': '#1e40af',      // Deep Blue
          'secondary': '#1e3a8a',    // Royal Blue
          'accent': '#d97706',       // Warm Amber/Orange
          'gold': '#f59e0b',         // Bright Gold
          'light': '#f8fafc',        // Pure White
          'navy': '#172554',         // Navy Blue
        },
        // Semantic Colors
        'success': '#16a34a',
        'warning': '#ea580c',
        'error': '#dc2626',
        'info': '#0284c7',
      },
      fontFamily: {
        'arabic': ['Cairo', 'Tajawal', 'sans-serif'],
        'english': ['Inter', 'Poppins', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glow: {
          '0%': { 'box-shadow': '0 0 20px rgba(212, 175, 55, 0.3)' },
          '100%': { 'box-shadow': '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}

