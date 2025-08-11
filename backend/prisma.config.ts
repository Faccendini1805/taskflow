import { defineConfig } from '@prisma/config';

export default defineConfig({
  seeds: {
    run: 'tsx prisma/seed.ts'
  }
});
