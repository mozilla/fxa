const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');

module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  // Jest ignores the tsconfig-paths hook that lib/config.js registers.
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/../../',
  }),
  testMatch: [
    '<rootDir>/lib/**/*.spec.ts',
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/test/**/*.in.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { isolatedModules: true, allowJs: false } },
    ],
  },
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 20000,
  clearMocks: true,
  // Coverage configuration (enabled via --coverage flag)
  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-profile-server-jest',
  coverageReporters: ['text', 'lcov', 'html'],
};
