/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0b1e36',
          800: '#0f2a4a', // Bleu foncé EventPartner
          700: '#163a66',
          600: '#1e40af',
          500: '#2563eb',
        },
        secondary: {
          500: '#0284c7',
          400: '#38bdf8', // Bleu clair
          300: '#7dd3fc',
          200: '#bae6fd',
          100: '#e0f2fe',
          50: '#f0f9ff',
        },
        accent: {
          DEFAULT: '#f97316', // Orange boutons importants
          hover: '#ea580c',
          light: '#ffedd5',
        },
        odd17: {
          navy: '#19486a',
          blue: '#1f6a9e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(15, 42, 74, 0.08)',
        'soft-lg': '0 10px 30px -4px rgba(15, 42, 74, 0.12)',
      },
      borderRadius: {
        'card': '1rem',
      }
    },
  },
  plugins: [],
}
