/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { getSharedTestServer, TestServerInstance } from '../support/helpers/test-server';
import pkg from '../../package.json';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Client = require('../client')();

let server: TestServerInstance;
let serverPort: number;

beforeAll(async () => {
  server = await getSharedTestServer();
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
      const email = server.uniqueEmail();
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

    it('"/" returns valid version information', async () => {
      const res = await fetch(`http://localhost:${serverPort}/`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Object.keys(json).sort()).toEqual(['commit', 'source', 'version']);
      expect(json.version).toBe(pkg.version);
      expect(json.source).toBeTruthy();
      expect(json.source).not.toBe('unknown');
      expect(json.commit).toMatch(/^[0-9a-f]{40}$/);
    });

    it('"/__version__" returns valid version information', async () => {
      const res = await fetch(`http://localhost:${serverPort}/__version__`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Object.keys(json).sort()).toEqual(['commit', 'source', 'version']);
      expect(json.version).toBe(pkg.version);
      expect(json.source).toBeTruthy();
      expect(json.source).not.toBe('unknown');
      expect(json.commit).toMatch(/^[0-9a-f]{40}$/);
    });
  }
);
