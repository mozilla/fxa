/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/** @type {import('jest').Config} */
export default {
  displayName: 'db-migrations',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json'],
  coverageDirectory: '../../coverage/packages/db-migrations',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'artifacts/tests/db-migrations',
        outputName: 'db-migrations-jest-results.xml',
      },
    ],
  ],
}
