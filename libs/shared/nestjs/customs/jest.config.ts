import { Config } from 'jest';

/* eslint-disable */
const config: Config = {
  displayName: 'shared-nestjs-customs',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/libs/nestjs/customs',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/lib/shared/nestjs/customs',
        outputName: 'nestjs-customs-jest-unit-results.xml',
      },
    ],
  ],
};

export default config;
