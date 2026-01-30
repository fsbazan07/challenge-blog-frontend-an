/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',

        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',

        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',

        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',

        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',

        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',

        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',

        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      animation: {
        dots: 'dots 1.4s ease-in-out infinite',
      },
      keyframes: {
        dots: {
          '0%, 100%': { transform: 'scale(0.8)', opacity: '0.35' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.animate-delay-0': { animationDelay: '0ms' },
        '.animate-delay-150': { animationDelay: '150ms' },
        '.animate-delay-300': { animationDelay: '300ms' },
        '.animate-delay-450': { animationDelay: '450ms' },
        '.animate-delay-600': { animationDelay: '600ms' },
      });
    },
  ],
};
