import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  viteFinal: async (viteConfig) =>
    mergeConfig(viteConfig, {
      optimizeDeps: {
        include: ['@base-ui/react/menu'],
      },
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('../src', import.meta.url)),
        },
      },
    }),
}

export default config
