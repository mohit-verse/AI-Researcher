/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Semantic Tokens
        surface: {
          DEFAULT: '#f9f9f8',
          dim: '#dadad9',
          bright: '#f9f9f8',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f3',
          container: '#eeeeed',
          'container-high': '#e8e8e7',
          'container-highest': '#e2e2e2',
        },
        'on-surface': {
          DEFAULT: '#1a1c1c',
          variant: '#44474a',
        },
        primary: {
          DEFAULT: '#070a0c',
          container: '#1e2124',
          'on-container': '#86888c',
        },
        secondary: {
          DEFAULT: '#506354',
          container: '#d0e5d2',
          'on-container': '#546758',
          fixed: '#d3e8d5',
          'fixed-dim': '#b7ccb9',
        },
        outline: {
          DEFAULT: '#75777a',
          variant: '#c5c6ca',
        },
        cream: {
          50: '#fcfbf8',
          100: '#f8f6f0',
          200: '#f0ede2',
          300: '#e5e1d3',
          400: '#d5cfbe',
        },
        charcoal: {
          800: '#272b30',
          850: '#1e2126',
          900: '#14171a',
          950: '#0d0f11',
        },
        olive: {
          50: '#f4f6f3',
          100: '#e6ede4',
          200: '#cddbc9',
          500: '#546b50',
          600: '#435840',
          700: '#354632',
          800: '#2a3728',
          900: '#1f281e',
        },
        sand: {
          border: '#e4e0d5',
          darkBorder: '#2e333a',
          surface: '#fbfaf7',
          muted: '#767267',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
