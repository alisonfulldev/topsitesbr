import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Will Bank brand palette
        brand: {
          DEFAULT: '#FFD100',
          hover: '#E0BC00',
          text: '#A08900',  // yellow dark enough for links on white bg
          dark: '#0D0B1F',
          'dark-hover': '#1A1635',
          'dark-border': '#2D2850',
          50: '#FFFBE6',
          100: '#FFF3A3',
          200: '#FFE566',
        },
      },
    },
  },
  plugins: [],
}

export default config
