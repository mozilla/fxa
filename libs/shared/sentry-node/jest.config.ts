import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-sentry-node',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/sentry-node',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-sentry-node',
        outputName: 'shared-sentry-node-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
