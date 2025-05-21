/* eslint-disable */
export default {
  displayName: 'accounts-rate-limit',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/rate-limit',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/accounts/rate-limit',
        outputName: 'accounts-rate-limit-jest-unit-results.xml',
      },
    ],
  ],
};
