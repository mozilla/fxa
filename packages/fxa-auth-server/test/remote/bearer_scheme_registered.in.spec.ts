/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

// M1 smoke test: the Bearer scheme is registered at server boot but no route
// is wired to it yet. Sending a valid-looking Bearer header at a Hawk-only
// route must still 401 — this proves registration has no side effects on
// existing routes, and that a bare Bearer header is not accidentally
// accepted anywhere in the monorepo prior to M2.
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

describe('#integration - Bearer scheme registration', () => {
  it('rejects a Bearer-on-Hawk-route request with 401 (no route accepts Bearer yet)', async () => {
    const hex64 = 'a'.repeat(64);
    const res = await fetch(
      `http://localhost:${serverPort}/v1/session/destroy`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer fxs_${hex64}`,
          'content-type': 'application/json',
        },
        body: '{}',
      }
    );
    expect(res.status).toBe(401);
  });

  it('rejects a malformed Bearer (plain hex, no prefix) with 401', async () => {
    const hex64 = 'b'.repeat(64);
    const res = await fetch(
      `http://localhost:${serverPort}/v1/session/destroy`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${hex64}`,
          'content-type': 'application/json',
        },
        body: '{}',
      }
    );
    expect(res.status).toBe(401);
  });
});
