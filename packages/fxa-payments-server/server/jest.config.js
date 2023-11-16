module.exports = {
  collectCoverageFrom: ['**/*.js', '!bin/*', '!coverage/**', '!**/jest*js'],
  // TO DO: update this file once more server tests are in place
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  transform: {
    "fxa-shared/*": [ "ts-jest", { "isolatedModules": true } ],
    "libs/shared/l10n/src": [ "ts-jest", { "isolatedModules": true } ],
  },
  moduleNameMapper: {
    "@fxa/shared/l10n": "../../../libs/shared/l10n/src",
  }
};
