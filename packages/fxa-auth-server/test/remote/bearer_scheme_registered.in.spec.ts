/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  getSharedTestServer,
  TestServerInstance,
} from '../support/helpers/test-server';

// Smoke test for the Bearer auth scheme: a Bearer header with an unknown id
// must 401, and a plain `Bearer <hex>` (refresh-token shape) must not be
// accepted on session-token routes. Guards the prefix-disjoint property
// that lets Bearer and Hawk coexist on multi-strategy chains.
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
  it('rejects a well-formed Bearer header with an unknown token id (401)', async () => {
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
