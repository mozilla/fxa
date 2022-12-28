module.exports = {
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  coveragePathIgnorePatterns: ['<rootDir>'],
  collectCoverageFrom: ['**/*.js', '!**/jest*js'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
