module.exports = {
  env: {
    node: true,
    browser: true,
  },
  extends: ['eslint:recommended', 'plugin:playwright/recommended'],
  globals: {
    globalThis: false, // not writeable
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'warn',
    'playwright/no-skipped-test': ['error', { allowConditional: true }],
    'no-console': ['error', { allow: ['log'] }], // console errors cause side effects in CircleCI (FXA-8773)
    'no-unused-vars': 'off',
  },
};
