import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-sentry-utils',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/sentry-utils',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-sentry-utils',
        outputName: 'shared-sentry-utils-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
