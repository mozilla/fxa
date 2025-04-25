import { Config } from 'jest';

/* eslint-disable */
const config: Config = {
  displayName: 'recovery-phone',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/recovery-phone',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/recovery-phone',
        outputName: 'recovery-phone-jest-unit-results.xml',
      },
    ],
  ],
};

export default config;
