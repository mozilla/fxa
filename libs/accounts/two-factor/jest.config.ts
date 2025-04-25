/* eslint-disable */

import { Config } from 'jest';

const config: Config = {
  displayName: 'accounts-two-factor',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/two-factor',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/accounts-two-factor',
        outputName: 'accounts-two-factor-jest-unit-results.xml',
      },
    ],
  ],
};

export default config;
