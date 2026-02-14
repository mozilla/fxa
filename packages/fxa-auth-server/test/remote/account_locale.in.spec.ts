/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      redis: { sessionTokens: { enabled: false } },
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
  '#integration$tag - remote account locale',
  ({ version, tag }) => {
    const testOptions = { version };

    it('a really long (invalid) locale', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        lang: Buffer.alloc(128).toString('hex'),
      });
      const response = await client.api.accountStatus(
        client.uid,
        client.sessionToken
      );
      expect(response.locale).toBeFalsy();
    });

    it('a really long (valid) locale', async () => {
      const email = server.uniqueEmail();
      const password = 'ilikepancakes';
      const client = await Client.create(server.publicUrl, email, password, {
        ...testOptions,
        lang: `en-US,en;q=0.8,${Buffer.alloc(128).toString('hex')}`,
      });
      const response = await client.api.accountStatus(
        client.uid,
        client.sessionToken
      );
      expect(response.locale).toBe('en-US,en;q=0.8');
    });
  }
);
