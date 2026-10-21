/* eslint-disable */
export default {
  displayName: 'accounts-subscriptions-legacy',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/subscriptions-legacy',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/accounts/subscriptions-legacy',
        outputName: 'accounts-subscriptions-legacy-jest-unit-results.xml',
      },
    ],
  ],
};
