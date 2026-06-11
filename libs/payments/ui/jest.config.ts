const { Config } = require('jest');
/* eslint-disable */
const { readFileSync } = require('fs');

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

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;

swcJestConfig.jsc.parser.tsx = true;
swcJestConfig.jsc.transform = {
  ...swcJestConfig.jsc.transform,
  react: { runtime: 'automatic' },
};

const config: Config = {
  displayName: 'payments-ui',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
    '\\.(svg|png|jpg|jpeg|gif|webp|ico)$':
      '<rootDir>/test/__mocks__/file-mock.js',
  },
  coverageDirectory: '../../../coverage/libs/payments/ui',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/payments-ui',
        outputName: 'payments-ui-jest-unit-results.xml',
      },
    ],
  ],
};
module.exports = config;
