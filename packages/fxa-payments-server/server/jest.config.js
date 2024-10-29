/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../tsconfig.server.json');

module.exports = {
  displayName: 'fxa-payments-server-server',
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  rootDir: '.',
  modulePaths: ['<rootDir>/dist'],
  // collectCoverageFrom: [
  //   'server/**/*.js',
  //   '!bin/*',
  //   '!coverage/**',
  //   '!**/jest*js',
  // ],
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
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  coverageDirectory: './coverage',
  testEnvironment: 'node',
};
