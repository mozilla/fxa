/* eslint-disable */
import { readFileSync } from 'fs';
import { Config } from 'jest';

const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8')
);

if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

const config: Config = {
  displayName: 'entitlements-metering',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../../coverage/libs/entitlements/metering',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/entitlements-metering',
        outputName: 'entitlements-metering-jest-unit-results.xml',
      },
    ],
  ],
};

export default config;
