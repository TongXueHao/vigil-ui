import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
  preflight: true,
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      primary: '#6366f1',
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  safelist: [
    'flex', 'items-center', 'justify-center', 'text-center',
    'p-2', 'p-3', 'p-4', 'px-4', 'py-2',
    'rounded', 'rounded-md', 'rounded-lg',
  ],
})


