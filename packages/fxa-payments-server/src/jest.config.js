module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/jest-style-mock.js',
  },
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.stories.*',
    '!**/types.tsx',
    '!**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 59,
      functions: 49,
      lines: 61,
      statements: 60
    },
  },
};
