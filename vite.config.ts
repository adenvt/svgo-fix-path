import { defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  base   : process.env.BASE_URL ?? '/',
  build  : { outDir: './demo/dist' },
  test   : { coverage: { all: false } },
})
