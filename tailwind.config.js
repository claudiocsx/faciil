/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        // Cores Neon da Identidade Faciil Tech
        'neon-cyan': '#1DF2FF',
        'neon-green': '#39FF14',
        'neon-lime': '#ADFF2F',
        'neon-amber': '#FFB800',
        // Cores de fundo dinâmicas (referenciam variáveis CSS)
        'bg-deep': 'var(--color-bg-deep)',
        'bg-card': 'var(--color-bg-card)',
        'bg-elevated': 'var(--color-bg-elevated)',
        'border-glow': 'var(--color-border-glow)',
        'border-subtle': 'var(--color-border-subtle)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-dim': 'var(--color-text-dim)',
        // Cores slate para tema claro
        'slate': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      borderRadius: {
        'faciiil': '2.5rem',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, #22d3ee 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
}
    },
  },
  plugins: [],
}