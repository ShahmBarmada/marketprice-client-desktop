// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt().overrideRules({
  '@typescript-eslint/no-explicit-any': 'off',
  'vue/max-attributes-per-line': [
    'error',
    {
      singleline: {
        max: 3,
      },
      multiline: {
        max: 1,
      },
    },
  ],
})
