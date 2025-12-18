/* eslint-disable */
export default {
  displayName: 'accounts-email-sender',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/email-sender',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/accounts/email-sender',
        outputName: 'accounts-email-sender-jest-unit-results.xml',
      },
    ],
  ],
};
