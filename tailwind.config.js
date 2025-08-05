/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem", 
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Mobile-specific breakpoints
      'mobile-xs': '320px',
      'mobile-sm': '375px', 
      'mobile-md': '414px',
      'mobile-lg': '480px',
      // Tablet breakpoints
      'tablet-sm': '640px',
      'tablet-md': '768px',
      'tablet-lg': '1024px',
      // Touch-friendly sizes
      'touch-sm': { 'max': '767px' },
      'touch-lg': { 'min': '768px' },
    },
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
        'sans': ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif': ['Lora', 'Georgia', 'serif'],
        'system': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        // Touch-friendly spacing
        'touch-sm': '44px',
        'touch-md': '48px', 
        'touch-lg': '52px',
        'thumb-zone': '48px',
      },
      fontSize: {
        // Mobile-optimized font sizes
        'mobile-xs': ['0.75rem', { lineHeight: '1rem' }],
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'mobile-base': ['1rem', { lineHeight: '1.5rem' }],
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem' }],
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem' }],
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'mobile-4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        // Touch-optimized button text
        'touch-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'touch-base': ['1rem', { lineHeight: '1.5rem' }],
        'touch-lg': ['1.125rem', { lineHeight: '1.75rem' }],
      },
      boxShadow: {
        // Mobile-optimized shadows for depth
        'mobile-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'mobile': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'mobile-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'mobile-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'mobile-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'touch': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      animation: {
        'gavel-strike': 'gavelStrike 0.5s ease-in-out',
        'scales-balance': 'scalesBalance 2s ease-in-out infinite',
        'dramatic-reveal': 'dramaticReveal 1s ease-out',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
        // Mobile-specific animations
        'mobile-slide-up': 'mobileSlideUp 0.3s ease-out',
        'mobile-slide-down': 'mobileSlideDown 0.3s ease-out', 
        'mobile-scale-in': 'mobileScaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'swipe-indicator': 'swipeIndicator 1.5s ease-in-out infinite',
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
        },
        // Mobile-specific keyframes
        mobileSlideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        mobileSlideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        mobileScaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        bounceGentle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -15px, 0)' },
          '70%': { transform: 'translate3d(0, -8px, 0)' },
          '90%': { transform: 'translate3d(0, -4px, 0)' }
        },
        swipeIndicator: {
          '0%': { transform: 'translateX(-10px)', opacity: '0.3' },
          '50%': { transform: 'translateX(10px)', opacity: '1' },
          '100%': { transform: 'translateX(-10px)', opacity: '0.3' }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        // Mobile-friendly rounded corners
        'mobile': '0.75rem',
        'mobile-lg': '1rem',
        'touch': '0.5rem',
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}