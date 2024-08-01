// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt().overrideRules({
  '@typescript-eslint/no-explicit-any': 'off',
  '@stylistic/max-len': ['error', { code: 120, tabWidth: 2 }],
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
  '@stylistic/member-delimiter-style': [
    'error',
    { singleline: { delimiter: 'semi' } },
  ],
  'vue/singleline-html-element-content-newline': 'off',
})
