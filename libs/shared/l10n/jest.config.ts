import { Config } from 'jest';
/* eslint-disable */
const config: Config = {
  displayName: 'shared-l10n',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '@fluent/react/esm/localization': '@fluent/react',
    'server-only': `<rootDir>/tests/__mocks__/empty.js`,
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/libs/shared/l10n',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-l10n',
        outputName: 'shared-l10n-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
