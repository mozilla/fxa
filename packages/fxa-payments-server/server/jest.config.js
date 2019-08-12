module.exports = {
  coveragePathIgnorePatterns: ['<rootDir>'],
  collectCoverageFrom: ['**/*.js', '!**/jest*js'],
  // TO DO: update this file once more server tests are in place
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};
