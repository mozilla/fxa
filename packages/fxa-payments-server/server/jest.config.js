/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('../../../tsconfig.base.json')

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
  // ts-jest - Paths mapping - With helper
  // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping#jest-config-with-helper
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {prefix: '<rootDir>/../../../'})
};
