/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Courtroom-themed color palette
        'gavel-blue': {
          DEFAULT: '#0A2240',
          50: '#E6EBF1',
          100: '#CCD8E3',
          200: '#99B1C7',
          300: '#668AAB',
          400: '#33638F',
          500: '#0A2240',
          600: '#081B33',
          700: '#061426',
          800: '#040D19',
          900: '#02060C'
        },
        'mahogany': {
          DEFAULT: '#4A2C2A',
          50: '#F4F0F0',
          100: '#E9E0E0',
          200: '#D3C1C1',
          300: '#BDA2A2',
          400: '#A78383',
          500: '#4A2C2A',
          600: '#3B2322',
          700: '#2C1A19',
          800: '#1D1110',
          900: '#0E0808'
        },
        'verdict-gold': {
          DEFAULT: '#D4AF37',
          50: '#FAF7ED',
          100: '#F4EFDB',
          200: '#EADFB7',
          300: '#DFCF93',
          400: '#D4BF6F',
          500: '#D4AF37',
          600: '#AA8C2C',
          700: '#7F6921',
          800: '#554616',
          900: '#2A230B'
        },
        'parchment': {
          DEFAULT: '#F5F5F5',
          50: '#FFFFFF',
          100: '#FCFCFC',
          200: '#F9F9F9',
          300: '#F7F7F7',
          400: '#F6F6F6',
          500: '#F5F5F5',
          600: '#E8E8E8',
          700: '#DBDBDB',
          800: '#CECECE',
          900: '#C1C1C1'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      fontFamily: {
        'serif': ['Lora', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'gavel-strike': 'gavelStrike 0.5s ease-in-out',
        'scales-balance': 'scalesBalance 2s ease-in-out infinite',
        'dramatic-reveal': 'dramaticReveal 1s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite'
      },
      keyframes: {
        gavelStrike: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(-15deg) scale(1.1)' },
          '100%': { transform: 'rotate(0deg) scale(1)' }
        },
        scalesBalance: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' }
        },
        dramaticReveal: {
          '0%': { opacity: '0', transform: 'scale(0.8) translateY(20px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}