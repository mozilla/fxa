export default {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/test/**/*.spec.ts',
    '<rootDir>/test/**/*.in.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { isolatedModules: true, allowJs: false } }],
  },
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 20000,
  clearMocks: true,
};
