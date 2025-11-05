/* eslint-disable */
export default {
  displayName: 'accounts-email-renderer',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/email-renderer',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/accounts/email-renderer',
        outputName: 'accounts-email-renderer-jest-unit-results.xml',
      },
    ],
  ],
};
