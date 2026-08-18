/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy tokens kept for any untouched data-layer refs
        primary: '#0b0e14',
        accent: {
          blue: '#00d4ff',
          cyan: '#00ffff',
          purple: '#8b5cf6'
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)'
        },
        // HydroSense design system tokens
        hs: {
          teal:     '#0F5C5B',
          'teal-light': '#3E8E8C',
          bg:       '#F7F9F8',
          surface:  '#FFFFFF',
          border:   '#E1E7E6',
          ink:      '#132A2A',
          muted:    '#5B6E6D',
          red:      '#D14343',
          amber:    '#C97A1F',
          green:    '#2E9E6C',
          'amber-data': '#E8A33D',
        }
      },
      fontFamily: {
        sans:  ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-dot': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06)',
        'card-md': '0 2px 8px rgba(0,0,0,0.08)',
        'sidebar': '1px 0 0 #E1E7E6',
      }
    },
  },
  plugins: [],
}