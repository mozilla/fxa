import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-otel',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/otel',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-otel',
        outputName: 'shared-otel-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
