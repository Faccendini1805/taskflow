import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Habilita PostCSS (Tailwind) y otras cositas útiles
  preprocess: preprocess({
    postcss: true
  }),

  kit: {
    adapter: adapter()
  }
};

export default config;
