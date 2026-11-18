/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#16221E',
          muted: '#5B6B65',
          light: '#8C9B95',
          faint: '#CBD6D2',
        },
        canvas: {
          DEFAULT: '#F2F5F3',
          subtle: '#E8EEEC',
          pure: '#FAFBFB',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.85)',
          overlay: 'rgba(22, 34, 30, 0.4)',
        },
        primary: {
          DEFAULT: '#2B6E63',
          hover: '#215750',
          active: '#1A453F',
          light: '#EBF3F1',
          subtle: '#F4F8F7',
          ring: 'rgba(43, 110, 99, 0.25)',
        },
        amber: {
          DEFAULT: '#E2A33B',
          hover: '#C88C2E',
          light: '#FEF6E9',
          border: '#F5D7A1',
        },
        success: {
          DEFAULT: '#3E8E5C',
          hover: '#317349',
          light: '#EBF5EF',
          border: '#A9DEBC',
        },
        alert: {
          DEFAULT: '#C4523E',
          hover: '#A53E2C',
          light: '#FBECE9',
          border: '#F2B9B0',
        },
        waiting: {
          DEFAULT: '#8A9993',
          faint: '#B8C2BE',
          light: '#F0F3F2',
          border: '#DCE3E0',
        },
        border: {
          DEFAULT: '#DCE3E0',
          subtle: '#E8EEEC',
          strong: '#B8C2BE',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"IBM Plex Sans"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'bezel-sm': 'inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 2px 6px -2px rgba(22, 34, 30, 0.05)',
        'bezel': 'inset 0 1px 1.5px rgba(255, 255, 255, 0.9), 0 8px 24px -8px rgba(22, 34, 30, 0.06)',
        'bezel-lg': 'inset 0 1px 2px rgba(255, 255, 255, 1), 0 16px 36px -12px rgba(22, 34, 30, 0.08)',
        'subtle-glow': '0 0 24px -4px rgba(43, 110, 99, 0.15)',
        'status-pulse': '0 0 0 4px rgba(226, 163, 59, 0.25)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.32, 0.72, 0, 1)',
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
