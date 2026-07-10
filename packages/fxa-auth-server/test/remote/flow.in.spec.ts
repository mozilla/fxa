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
      signinConfirmation: { skipForNewAccounts: { enabled: true } },
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
  '#integration$tag - remote flow',
  ({ version, tag }) => {
    const testOptions = { version };
    let email1: string;

    beforeAll(() => {
      email1 = server.uniqueEmail();
    });

    it('Create account flow', async () => {
      const email = email1;
      const password = 'allyourbasearebelongtous';
      const client = await Client.createAndVerify(
        server.publicUrl,
        email,
        password,
        server.mailbox,
        { ...testOptions, keys: true }
      );
      const keys = await client.keys();
      expect(typeof keys.kA).toBe('string');
      expect(typeof keys.wrapKb).toBe('string');
      expect(typeof keys.kB).toBe('string');
      expect(client.getState().kB.length).toBe(64);
    });

    it('Login flow', async () => {
      const email = email1;
      const password = 'allyourbasearebelongtous';
      const client = await Client.login(server.publicUrl, email, password, {
        ...testOptions,
        keys: true,
      });
      expect(client.authAt).toBeTruthy();
      expect(client.uid).toBeTruthy();
      const keys = await client.keys();
      expect(typeof keys.kA).toBe('string');
      expect(typeof keys.wrapKb).toBe('string');
      expect(typeof keys.kB).toBe('string');
      expect(client.getState().kB.length).toBe(64);
    });
  }
);
