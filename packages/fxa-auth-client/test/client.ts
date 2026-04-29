/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as assert from 'assert';
import AuthClient from '../server';

describe('lib/client', () => {
  let client: AuthClient;

  before(() => {
    client = new AuthClient('http://localhost:9000', {
      requireHeaders: true,
    });
  });

  it('fails without headers', async () => {
    client = new AuthClient('http://localhost:9000', {
      requireHeaders: true,
    });

    try {
      // check that general requests require header
      await client.accountStatus('0123456789abcdef');
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'extraHeaders missing!');
    }

    try {
      // check that session requests require header
      await client.sessionStatus('0123456789abcdef');
      assert.fail();
    } catch (e) {
      assert.equal(e.message, 'extraHeaders missing!');
    }
  });

  describe('credentials upgrade for WAF challenges', () => {
    let httpsClient: AuthClient;
    let originalFetch: typeof globalThis.fetch;
    let lastInit: RequestInit | undefined;

    before(() => {
      httpsClient = new AuthClient('https://localhost:9000');
    });

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      lastInit = undefined;
      globalThis.fetch = (async (_url: string, init?: RequestInit) => {
        lastInit = init;
        return new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }) as typeof globalThis.fetch;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('sets credentials=include on POST /account/login', async () => {
      await httpsClient.signInWithAuthPW('user@example.com', '00'.repeat(32));
      assert.equal(lastInit?.credentials, 'include');
    });

    it('sets credentials=include on POST /account/login?keys=true', async () => {
      await httpsClient.signInWithAuthPW('user@example.com', '00'.repeat(32), {
        keys: true,
      });
      assert.equal(lastInit?.credentials, 'include');
    });

    it('does not set credentials on /account/login/send_unblock_code', async () => {
      await httpsClient.sendUnblockCode('user@example.com');
      assert.notEqual(lastInit?.credentials, 'include');
    });

    it('does not set credentials on /account/login/reject_unblock_code', async () => {
      await httpsClient.rejectUnblockCode(
        '0123456789abcdef0123456789abcdef',
        'ABCD1234'
      );
      assert.notEqual(lastInit?.credentials, 'include');
    });
  });
});
