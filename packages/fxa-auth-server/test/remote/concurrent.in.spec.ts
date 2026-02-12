/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();

let server: TestServerInstance;

beforeAll(async () => {
  server = await createTestServer({
    configOverrides: {
      verifierVersion: 1,
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
  '#integration$tag - remote concurrent',
  ({ version, tag }) => {
    const testOptions = { version };

    it('concurrent create requests', async () => {
      const email = server.uniqueEmail();
      const password = 'abcdef';
      // Two shall enter, only one shall survive!
      const r1 = Client.create(server.publicUrl, email, password, testOptions);
      const r2 = Client.create(server.publicUrl, email, password, testOptions);
      const results = await Promise.allSettled([r1, r2]);
      const rejected = results.filter((p) => p.status === 'rejected');
      expect(rejected.length).toBe(1);
      await server.mailbox.waitForEmail(email);
    });
  }
);
