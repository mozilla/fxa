/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { createTestServer, TestServerInstance } from '../support/helpers/test-server';

describe('#integration - smoke test', () => {
  let server: TestServerInstance;

  beforeAll(async () => {
    server = await createTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  it('server responds to heartbeat', async () => {
    const response = await fetch(`${server.publicUrl}/__heartbeat__`);
    expect(response.ok).toBe(true);
  });

  it('server responds to API endpoint', async () => {
    const response = await fetch(`${server.publicUrl}/v1/account/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.exists).toBe(false);
  });

  it('generates unique emails', () => {
    const email1 = server.uniqueEmail();
    const email2 = server.uniqueEmail();

    expect(email1).toMatch(/@restmail\.net$/);
    expect(email2).toMatch(/@restmail\.net$/);
    expect(email1).not.toBe(email2);
  });

  it('config has correct publicUrl', () => {
    expect(server.config.publicUrl).toBe(server.publicUrl);
    expect(server.publicUrl).toMatch(/^http:\/\/localhost:\d+$/);
  });
});
