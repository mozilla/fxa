import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-sentry-next',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/sentry-next',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-sentry-next',
        outputName: 'shared-sentry-next-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
