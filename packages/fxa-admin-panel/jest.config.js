/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');

module.exports = {
  roots: ['<rootDir>/src'],
  // Tests were written against create-react-app's default, and share module
  // level spies that must not leak between cases.
  resetMocks: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': [
      'ts-jest',
      { isolatedModules: true, tsconfig: { allowJs: true } },
    ],
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)':
      '<rootDir>/../fxa-react/file-transform.js',
  },
  // ts-jest - Paths mapping - With helper
  // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping#jest-config-with-helper
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/../../',
    }),
    '\\.css$': 'identity-obj-proxy',
  },
};
