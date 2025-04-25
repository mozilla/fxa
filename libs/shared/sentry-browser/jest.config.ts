import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-sentry-browser',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/sentry-browser',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-sentry-browser',
        outputName: 'shared-sentry-browser-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
