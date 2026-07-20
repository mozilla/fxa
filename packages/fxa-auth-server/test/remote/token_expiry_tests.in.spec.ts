/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  createTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';
import { AuthServerError } from '../support/helpers/test-utils';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      tokenLifetimes: {
        passwordChangeToken: 1,
        sessionTokenWithoutDevice: 1,
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
  '#integration$tag - remote token expiry',
  ({ version, tag }) => {
    const testOptions = { version };

    it('token expiry', async () => {
      const email = server.uniqueEmail();
      const password = 'ok';

      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        preVerified: true,
      });

      try {
        await client.changePassword('hello');
        fail('should have thrown');
      } catch (err: unknown) {
        const e = err as AuthServerError;
        expect(e.errno).toBe(110);
      }
    });

    it('session token expires', async () => {
      const email = server.uniqueEmail();
      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        'wibble',
        server.mailbox,
        testOptions
      );

      try {
        await client.sessionStatus();
        fail('client.sessionStatus should have failed');
      } catch (err: unknown) {
        const e = err as AuthServerError;
        expect(e.errno).toBe(110);
      }
    });
  }
);
