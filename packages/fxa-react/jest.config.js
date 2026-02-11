/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');

module.exports = {
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { isolatedModules: true }],
    '^.+\\.svg$': '<rootDir>/svg-transform.js',
  },
  // ts-jest - Paths mapping - With helper
  // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping#jest-config-with-helper
  roots: ['<rootDir>'],
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/../../',
    }),
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  // Matches create-react-app
  setupFilesAfterEnv: ['./setupTests.ts'],
};
