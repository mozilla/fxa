export default {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/lib/**/*.spec.ts', '<rootDir>/test/**/*.spec.ts'],
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
