import { Config } from 'jest';

/* eslint-disable */
const config: Config = {
  displayName: 'passkey',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/accounts/passkey',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/accounts-passkey',
        // It is critical that the package_name here is unique among all
        // Jest configs. This file is uploaded to GCS and will error on upload
        // if not unique because permissions for the upload deliberately prevent
        // overwriting files.
        outputName: 'accounts-passkey-jest-unit-results.xml',
      },
    ],
  ],
};

export default config;
