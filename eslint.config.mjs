import { createConfigForNuxt } from '@nuxt/eslint-config';

export default createConfigForNuxt({
  features: {
    stylistic: { indent: 2, quotes: 'single', semi: true },
  },
})
  .override('nuxt/rules', {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  });
