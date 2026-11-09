/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Azul institucional tomado del diseño de Figma
        oax: {
          50: '#eef6fb',
          100: '#dcecf6',
          200: '#bcd9ec',
          500: '#1a77b3',
          600: '#0f6aa6',
          700: '#0b5c93',
          800: '#0a4a78',
          900: '#083a5f',
        },
        lienzo: '#f5f5f7',
        alerta: '#d92d20',
        operativo: '#12a150',
      },
      boxShadow: {
        tarjeta: '0 1px 2px rgba(16,24,40,.06), 0 8px 24px rgba(16,24,40,.06)',
      },
      keyframes: {
        marquesina: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquesina: 'marquesina 40s linear infinite',
      },
    },
  },
  plugins: [],
}
