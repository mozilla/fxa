/* eslint-disable */
export default {
  displayName: 'accounts-auth-client',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/auth-client',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/accounts/auth-client',
        outputName: 'accounts-auth-client-jest-unit-results.xml',
      },
    ],
  ],
};
