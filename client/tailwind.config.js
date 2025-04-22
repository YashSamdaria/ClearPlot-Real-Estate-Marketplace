/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway', 'sans-serif'],
      },
      colors: {
        amber: {
          600: '#1E293B', // Primary accent for buttons and titles
          700: '#D97706', // Hover state
        },
        teal: {
          400: '#2DD4BF', // Icons and secondary accents
        },
        slate: {
          700: '#334155', // Borders
          800: '#1E293B', // Card backgrounds
          900: '#0F172A', // CTA section background
        },
        offwhite: {
          100: '#F3F4F6', // Primary text
        },
      },
      
    },
  },
  plugins: [],
}
