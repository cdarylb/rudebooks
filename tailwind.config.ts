import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {
        // Fond — Ardoise
        background: '#0F1117',
        surface: {
          DEFAULT: '#171B26',
          2: '#1E2336',
          3: '#252B3D',
        },
        // Bordures
        edge: '#2D3348',
        // Texte
        ink: {
          DEFAULT: '#E8E6F0',
          muted: '#8890A8',
          subtle: '#525970',
        },
        // Accent unique — violet ardoise
        primary: {
          DEFAULT: '#8B5CF6',
          50:  '#F3EFFE',
          100: '#E4D7FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        // Alias accent = primary pour compatibilité
        accent: {
          DEFAULT: '#8B5CF6',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
        'gradient-warm':    'linear-gradient(135deg, #A78BFA, #8B5CF6)',
        'gradient-cool':    'linear-gradient(135deg, #8B5CF6, #6D28D9)',
        'gradient-card':    'linear-gradient(135deg, #1E2336, #252B3D)',
      },
      boxShadow: {
        card:       '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3)',
        'card-hover': '0 4px 20px 0 rgb(0 0 0 / 0.5), 0 0 0 1px rgb(139 92 246 / 0.2)',
        glow:       '0 0 20px rgb(139 92 246 / 0.3)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in':  'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
