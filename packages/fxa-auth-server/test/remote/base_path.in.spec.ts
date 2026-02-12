/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

const Client = require('../client')();

let server: TestServerInstance;
let serverPort: number;

beforeAll(async () => {
  server = await createTestServer();
  const url = new URL(server.publicUrl);
  serverPort = parseInt(url.port, 10);
}, 120000);

afterAll(async () => {
  await server.stop();
});

const testVersions = [
  { version: '', tag: '' },
  { version: 'V2', tag: 'V2' },
];

describe.each(testVersions)(
  '#integration$tag - remote base path',
  ({ version, tag }) => {
    const testOptions = { version };

    it('base path account creation', async () => {
      const email = `${Math.random()}@example.com`;
      const password = 'ok';
      // if this doesn't crash, we're all good
      await Client.create(server.publicUrl, email, password, testOptions);
    });

    it('.well-known did not move', async () => {
      const res = await fetch(
        `http://localhost:${serverPort}/.well-known/browserid`
      );
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.authentication).toBe(
        '/.well-known/browserid/nonexistent.html'
      );
    });

    // The version routes (/, /__version__) require the server to be started
    // with a non-root base path (e.g. /auth). The child-process TestServer
    // does not yet support custom base paths, so these are skipped for now.
    // The original Mocha test configured publicUrl = 'http://localhost:9000/auth'.
    it.todo('"/" returns valid version information');
    it.todo('"/__version__" returns valid version information');
  }
);
