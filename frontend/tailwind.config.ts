import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        brand: 'var(--brand)',
        accent: 'var(--accent)',
        win: 'var(--win)',
        lose: 'var(--lose)',
        card: 'var(--card)',
        border: 'var(--border)',
        pastel: {
          pink: 'var(--pastel-pink)',
          mint: 'var(--pastel-mint)',
          yellow: 'var(--pastel-yellow)',
          blue: 'var(--pastel-blue)',
          lilac: 'var(--pastel-lilac)',
        },
      },
      borderRadius: { xl2: '1.25rem' },
      keyframes: {
        pop: { '0%': { transform: 'scale(.96)', opacity: .6 }, '100%': { transform:'scale(1)', opacity:1 } },
        confetti: { '0%':{ transform:'translateY(-20px)', opacity:0 }, '100%':{ transform:'translateY(0)', opacity:1 }},
        shake: { '0%,100%':{ transform:'translateX(0)'}, '25%':{ transform:'translateX(-4px)'}, '75%':{ transform:'translateX(4px)'} },
      },
      animation: {
        pop: 'pop .24s ease-out',
        confetti: 'confetti .4s ease-out',
        shake: 'shake .28s ease-in-out',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(0,0,0,.06)',
      }
    }
  },
  plugins: [],
} satisfies Config
