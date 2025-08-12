import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:4000';

const config: UserConfig = {
  plugins: [sveltekit()],
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true
      }
    }
  }
};

export default config;
