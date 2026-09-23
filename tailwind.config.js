/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tattvaCo: {
          bg: '#0c0e12',
          surface: '#13161c',
          card: '#181c24',
          subtle: '#222834',
          border: '#2a3140',
          'border-light': '#364053',
          orange: '#f25b2a',
          'orange-hover': '#e04b1a',
          'orange-subtle': 'rgba(242, 91, 42, 0.12)',
          sidebar: '#0d0f14',
          text: '#f1f3f7',
          muted: '#8b96a8',
          accent: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444'
        },
        tattava: {
          bg: '#0c0e12',
          surface: '#13161c',
          card: '#181c24',
          subtle: '#222834',
          border: '#2a3140',
          'border-light': '#364053',
          orange: '#f25b2a',
          'orange-hover': '#e04b1a',
          'orange-subtle': 'rgba(242, 91, 42, 0.12)',
          sidebar: '#0d0f14',
          text: '#f1f3f7',
          muted: '#8b96a8',
          accent: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier Prime', 'Courier New', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['Caveat', 'Playfair Display', 'cursive', 'serif']
      },
      boxShadow: {
        'glow-orange': '0 0 20px -5px rgba(242, 91, 42, 0.3)',
        'glow-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)'
      }
    },
  },
  plugins: [],
}
