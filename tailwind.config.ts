import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'diary-pink': '#ff2d9c',
        'diary-hotpink': '#ff5cb8',
        'diary-purple': '#8b2fc9',
        'diary-black': '#141014',
        'diary-paper': '#fdf6f0',
        'diary-line': '#c9d6ea',
      },
      fontFamily: {
        hand: ['var(--font-hand)'],
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      boxShadow: {
        sticker: '0 6px 16px -4px rgba(0,0,0,0.35)',
        glow: '0 0 24px rgba(255,45,156,0.65), 0 0 60px rgba(255,45,156,0.35)',
      },
    },
  },
  plugins: [],
};
export default config;
