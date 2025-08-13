/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/**/*.{html,js,svelte,ts}',
      './src/routes/**/*.{svelte,ts}',
      './src/lib/**/*.{svelte,ts}'
    ],
    theme: {
      extend: {
        colors: {
          // Paleta basada en Bootstrap/AdminLTE
          primary: '#007bff',
          secondary: '#6c757d',
          success: '#28a745',
          info: '#17a2b8',
          warning: '#ffc107',
          danger: '#dc3545',
          light: '#f8f9fa',
          dark: '#343a40',
        },
        fontFamily: {
          // Fuente del sitio objetivo
          sans: ['"Source Sans Pro"', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };