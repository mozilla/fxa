import { Config } from 'jest';
/* eslint-disable */

const config: Config = {
  displayName: 'shared-db-mysql-legacy',
  preset: '../../../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../../../../coverage/libs/shared/db/mysql/legacy',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/shared-db-mysql-legacy',
        outputName: 'shared-db-mysql-legacy-jest-unit-results.xml',
      },
    ],
  ],
};
export default config;
