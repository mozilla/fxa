module.exports = {
  env: {
    node: true,
    browser: true,
  },
  extends: [
    // 'eslint:recommended',
    // 'plugin:playwright/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/ban-types': 'warn',
    // 'playwright/missing-playwright-await': 'off',
    'no-console': ['error', { allow: ['log'] }], // console errors cause side effects in CircleCI
  },
};
