/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  AuthServerEmailCapabilityClient,
  AuthServerEmailCapabilityClientError,
} from './auth-server-email-capability.client';

describe('AuthServerEmailCapabilityClient', () => {
  const baseConfig = {
    baseUrl: 'https://auth.example.test/',
    subscriptionsSecret: 'secret-token',
  };

  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ applied: 1, unknownAccount: 0 }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('POSTs to the correct URL with the expected headers and body', async () => {
    const client = new AuthServerEmailCapabilityClient(baseConfig);

    await client.notifyChange({
      changes: [{ email: 'a@example.com', added: ['capA'] }],
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      'https://auth.example.test/oauth/subscriptions/email-capability-changed'
    );
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      authorization: 'Bearer secret-token',
      'content-type': 'application/json',
    });
    expect(JSON.parse(init.body)).toEqual({
      changes: [{ email: 'a@example.com', added: ['capA'] }],
    });
  });

  it('returns the parsed response body', async () => {
    const client = new AuthServerEmailCapabilityClient(baseConfig);

    const result = await client.notifyChange({
      changes: [{ email: 'a@example.com', added: ['capA'] }],
    });

    expect(result).toEqual({ applied: 1, unknownAccount: 0 });
  });

  it('throws AuthServerEmailCapabilityClientError on non-2xx', async () => {
    fetchSpy.mockResolvedValue(
      new Response('nope', { status: 500, statusText: 'Server Error' })
    );
    const client = new AuthServerEmailCapabilityClient(baseConfig);

    await expect(
      client.notifyChange({
        changes: [{ email: 'a@example.com', added: ['capA'] }],
      })
    ).rejects.toBeInstanceOf(AuthServerEmailCapabilityClientError);
  });
});
