/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSharedTestServer, TestServerInstance } from '../support/helpers/test-server';
import { AuthServerError } from '../support/helpers/test-utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await getSharedTestServer();
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote account unlock',
  ({ version, tag }) => {
    const testOptions = { version };

    it('/account/lock is no longer supported', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        testOptions
      );
      try {
        await c.lockAccount();
        fail('should get an error');
      } catch (e: unknown) {
        expect((e as AuthServerError).code).toBe(410);
      }
    });

    it('/account/unlock/resend_code is no longer supported', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        testOptions
      );
      try {
        await c.resendAccountUnlockCode('en');
        fail('should get an error');
      } catch (e: unknown) {
        expect((e as AuthServerError).code).toBe(410);
      }
    });

    it('/account/unlock/verify_code is no longer supported', async () => {
      const c = await Client.create(
        server.publicUrl,
        server.uniqueEmail(),
        'password',
        testOptions
      );
      try {
        await c.verifyAccountUnlockCode('bigscaryuid', 'bigscarycode');
        fail('should get an error');
      } catch (e: unknown) {
        expect((e as AuthServerError).code).toBe(410);
      }
    });
  }
);
