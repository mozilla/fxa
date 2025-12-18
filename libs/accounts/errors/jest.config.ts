/* eslint-disable */
export default {
  displayName: 'accounts-errors',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/errors',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/accounts/errors',
        outputName: 'accounts-errors-jest-unit-results.xml',
      },
    ],
  ],
};
