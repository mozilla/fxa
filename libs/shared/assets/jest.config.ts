import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-assets',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/assets',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-assets',
        outputName: 'shared-assets-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
