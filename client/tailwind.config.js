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
          bg: '#0c0e14',
          surface: '#12151d',
          card: '#181c26',
          subtle: '#202534',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.14)',
          orange: '#f25b2a',
          'orange-hover': '#e04b1a',
          'orange-subtle': 'rgba(242, 91, 42, 0.12)',
          sidebar: '#0a0c12',
          text: '#fbf8f3',
          muted: '#8b96a8',
          accent: '#3b82f6',
          green: '#33cc7a',
          amber: '#f59e0b',
          red: '#ef4444'
        },
        tattava: {
          bg: '#0c0e14',
          surface: '#12151d',
          card: '#181c26',
          subtle: '#202534',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-light': 'rgba(255, 255, 255, 0.14)',
          orange: '#f25b2a',
          'orange-hover': '#e04b1a',
          'orange-subtle': 'rgba(242, 91, 42, 0.12)',
          sidebar: '#0a0c12',
          text: '#fbf8f3',
          muted: '#8b96a8',
          accent: '#3b82f6',
          green: '#33cc7a',
          amber: '#f59e0b',
          red: '#ef4444'
        },
        // Linea Design System Color Tokens
        obsidian: {
          950: '#0a0c12',
          900: '#0e1119',
          850: '#131722',
          800: '#181d2a',
          750: '#1f2536',
          700: '#283045',
          600: '#35405c'
        },
        parchment: {
          50: '#faf5f0',
          100: '#f5ede3',
          200: '#e7dcce',
          300: '#cbbda9',
          400: '#9e907c',
          500: '#6e6250'
        },
        signal: {
          mint: '#33cc7a',
          'mint-dark': '#24a35e',
          'mint-glow': 'rgba(51, 204, 122, 0.25)'
        },
        cinema: {
          amber: '#f59e0b',
          honey: '#fbbf24',
          gold: '#d97706',
          'amber-glow': 'rgba(245, 158, 11, 0.25)'
        }
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
        'pill': '9999px'
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Courier Prime', 'Courier New', 'monospace'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        handwriting: ['Caveat', 'Playfair Display', 'cursive', 'serif']
      },
      boxShadow: {
        'linea-card': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 12px 32px -8px rgba(0, 0, 0, 0.6)',
        'linea-card-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), 0 20px 40px -12px rgba(0, 0, 0, 0.75)',
        'linea-pill': '0 2px 10px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.35)',
        'glow-mint': '0 0 24px -4px rgba(51, 204, 122, 0.35)',
        'glow-orange': '0 0 20px -5px rgba(242, 91, 42, 0.3)',
        'glow-subtle': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.35)'
      }
    },
  },
  plugins: [],
}
