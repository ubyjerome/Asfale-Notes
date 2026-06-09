/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      borderRadius: {
        'radius-sm': '6px',
        'radius-md': '10px',
        'radius-lg': '12px',
        'radius-full': '9999px',
      },
      colors: {
        canvas: 'var(--color-canvas)',
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        muted: 'var(--color-muted)',
        hairline: 'var(--color-hairline)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-strong': 'var(--color-surface-strong)',
        'surface-dark': 'var(--color-surface-dark)',
        primary: 'var(--color-primary)',
        'primary-active': 'var(--color-primary-active)',
        link: 'var(--color-link)',
        'on-primary': 'var(--color-on-primary)',
      },
    },
  },
  plugins: [],
};
