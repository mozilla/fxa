/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      verifierVersion: 0,
      securityHistory: {
        ipProfiling: {
          allowedRecency: 0,
        },
      },
    },
  });
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote verifier upgrade',
  ({ version, tag }) => {
    const testOptions = { version };

    // This test is skipped in the original Mocha version as well.
    // It requires restarting the server mid-test with a different verifierVersion,
    // which is not straightforward with the child-process test server.
    it.skip('upgrading verifierVersion upgrades the account on password change', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';

      await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        preVerified: true,
        keys: true,
      });

      // The original test restarts the server with verifierVersion: 1 here,
      // then logs in and changes password, then checks verifierVersion is 1.
      // This is not feasible with the child-process test server without
      // additional infrastructure.
    });
  }
);
