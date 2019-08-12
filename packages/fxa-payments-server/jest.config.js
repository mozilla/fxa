module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/build/*',
    '!**/*.stories.*',
    '!**/types.tsx',
    '!**/*.d.ts',
    '!**/jest*js',
  ],
  coverageThreshold: {
    global: {
      branches: 64,
      functions: 53,
      lines: 64,
      statements: 64,
    },
  },
};
