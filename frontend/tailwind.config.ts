import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '600px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        'muted-strong': 'var(--muted-strong)',
        on: {
          brand: 'var(--on-brand)',
          accent: 'var(--on-accent)',
          win: 'var(--on-win)',
          lose: 'var(--on-lose)',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          strong: 'var(--brand-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accent-strong)',
        },
        surface: 'var(--surface)',
        'surface-subtle': 'var(--surface-subtle)',
        card: 'var(--card)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        win: 'var(--win)',
        lose: 'var(--lose)',
        pastel: {
          pink: 'var(--pastel-pink)',
          mint: 'var(--pastel-mint)',
          yellow: 'var(--pastel-yellow)',
          blue: 'var(--pastel-blue)',
          lilac: 'var(--pastel-lilac)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        xs: ['var(--step--1)', { lineHeight: 'var(--line-snug)' }],
        sm: ['calc(var(--step--1) + 0.05rem)', { lineHeight: 'var(--line-relaxed)' }],
        base: ['var(--step-0)', { lineHeight: 'var(--line-relaxed)' }],
        lg: ['var(--step-1)', { lineHeight: 'var(--line-relaxed)' }],
        xl: ['var(--step-2)', { lineHeight: 'var(--line-snug)' }],
        '2xl': ['var(--step-3)', { lineHeight: 'var(--line-tight)' }],
        '3xl': ['var(--step-4)', { lineHeight: 'var(--line-tight)' }],
        '4xl': ['var(--step-5)', { lineHeight: 'var(--line-tight)' }],
      },
      borderRadius: {
        none: '0',
        sm: 'var(--radius-xs)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-xxl)',
        pill: 'var(--radius-pill)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(.96)', opacity: 0.6 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        fadeUp: {
          '0%': { transform: 'translateY(6px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        confetti: {
          '0%': { transform: 'translateY(-20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        pop: 'pop .24s ease-out',
        'fade-up': 'fadeUp .36s ease-out',
        confetti: 'confetti .4s ease-out',
        shake: 'shake .28s ease-in-out',
        shimmer: 'shimmer 1.4s var(--transition-base) infinite',
        float: 'floaty 4.2s ease-in-out infinite',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        float: 'var(--shadow-float)',
        inner: 'var(--shadow-inner)',
        pastel: '0 10px 45px rgba(255, 214, 231, 0.32)',
      },
      backgroundImage: {
        'gradient-brand': 'var(--gradient-brand)',
        'gradient-card': 'var(--gradient-card)',
      },
      transitionTimingFunction: {
        base: 'var(--transition-base)',
        snappy: 'var(--transition-snappy)',
      },
    },
  },
  plugins: [],
} satisfies Config
