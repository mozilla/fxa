/* eslint-disable */
import { readFileSync } from 'fs';
import { Config } from 'jest';

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8')
);

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

// @openmeter/client ships JS with sourceMappingURL comments but no .map files,
// which makes SWC log noisy "failed to read input source map" errors when it
// transforms that package for jest. We do not need input source maps in tests.
swcJestConfig.inputSourceMap = false;

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;

const config: Config = {
  displayName: 'entitlements-metering',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  transformIgnorePatterns: ['node_modules/(?!(@openmeter/client|ky)/)'],
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
