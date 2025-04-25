import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-sentry-nest',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/sentry-nest',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-sentry-nest',
        outputName: 'shared-sentry-nest-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
