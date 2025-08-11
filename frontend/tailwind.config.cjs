/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{html,js,svelte,ts}', // Escanea todo dentro de src
    ],
    darkMode: 'class', // Soporte para modo oscuro mediante clase 'dark'
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#2563eb', // Azul Tailwind 600
            light: '#3b82f6',   // Azul Tailwind 500
            dark: '#1e40af',    // Azul Tailwind 900
          },
          secondary: {
            DEFAULT: '#f97316', // Naranja Tailwind 500
            light: '#fb923c',   // Naranja Tailwind 400
            dark: '#c2410c',    // Naranja Tailwind 700
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };
  