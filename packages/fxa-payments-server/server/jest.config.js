// TO DO: update this file once more server tests are in place
module.exports = {
  collectCoverageFrom: ['lib/**'],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 50,
      statements: 50,
    },
  },
};
