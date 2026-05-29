/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Page + surfaces
        bg: '#0a0e14',
        surface: {
          DEFAULT: '#131922', // cards
          2: '#0f1419', // elevated / sidebar
        },
        // Borders
        border: {
          DEFAULT: '#1f2937',
          hi: '#334155',
        },
        // Text
        text: {
          DEFAULT: '#e6edf3',
          dim: '#94a3b8',
          faint: '#64748b',
        },
        // Signature amber (Trust Layer / primary actions)
        accent: {
          DEFAULT: '#f59e0b',
          dim: '#b45309',
        },
        // Status
        success: '#10b981',
        warning: '#f97316',
        danger: '#ef4444',
        info: '#3b82f6',
        violet: '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      borderColor: {
        DEFAULT: '#1f2937',
      },
      maxWidth: {
        content: '1280px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
