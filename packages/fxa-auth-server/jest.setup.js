/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest global setup - runs before each test file.
 *
 * Set NODE_ENV=dev so that the config module loads config/dev.json,
 * which includes OAuth keys (config/key.json), authServerSecrets,
 * and other values required by unit tests. This matches the CI test
 * runner (scripts/test-ci.sh) which also exports NODE_ENV=dev.
 *
 * Jest defaults NODE_ENV to 'test', but there is no config/test.json
 * in this package, so tests fail without the dev config overlay.
 */
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'test') {
  process.env.NODE_ENV = 'dev';
}
