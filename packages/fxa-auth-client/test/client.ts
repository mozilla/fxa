/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as assert from 'assert';
import AuthClient from '../server';

// TODO: Use proper mocks when we move to jest. Not going to add sinon dep just for this...
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SentryModule = require('@sentry/browser') as Record<string, any>;

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

  describe('createOAuthToken', () => {
    let httpsClient: AuthClient;
    let originalFetch: typeof globalThis.fetch;
    let lastBody: Record<string, any> | undefined;
    // valid-length hex so HAWK credential derivation succeeds
    const sessionToken = 'a'.repeat(64);

    before(() => {
      httpsClient = new AuthClient('https://localhost:9000');
    });

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      lastBody = undefined;
      globalThis.fetch = (async (_url: string, init?: RequestInit) => {
        lastBody = init?.body ? JSON.parse(init.body as string) : undefined;
        return new Response('{"access_token":"token"}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }) as typeof globalThis.fetch;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('forwards exclude_dau to /oauth/token when set', async () => {
      await httpsClient.createOAuthToken(sessionToken, 'ea3ca969f8c6bb0d', {
        scope: 'profile:avatar',
        exclude_dau: true,
      });
      assert.equal(lastBody?.exclude_dau, true);
    });

    it('omits exclude_dau from the payload when not set', async () => {
      await httpsClient.createOAuthToken(sessionToken, 'ea3ca969f8c6bb0d', {
        scope: 'profile:avatar',
      });
      // cleanStringify drops null/undefined, so the key is absent entirely
      assert.ok(lastBody && !('exclude_dau' in lastBody));
    });
  });

  describe('request() error handling', () => {
    let httpClient: AuthClient;
    let originalFetch: typeof globalThis.fetch;
    let originalCaptureMessage: (...args: any[]) => any;
    let capturedMessages: Array<{
      message: string;
      context: Record<string, any>;
    }>;

    before(() => {
      httpClient = new AuthClient('http://localhost:9000');
    });

    beforeEach(() => {
      capturedMessages = [];
      originalFetch = globalThis.fetch;
      originalCaptureMessage = SentryModule.captureMessage;
      SentryModule.captureMessage = (
        message: string,
        context: Record<string, any>
      ) => {
        capturedMessages.push({ message, context });
        return '';
      };
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
      SentryModule.captureMessage = originalCaptureMessage;
    });

    it('does not manually capture a successful response to Sentry', async () => {
      globalThis.fetch = async () =>
        new Response('{"exists":true}', { status: 200 });
      await httpClient.accountStatus('0123456789abcdef');
      assert.equal(capturedMessages.length, 0);
    });

    it('does not manually capture a known errno response to Sentry', async () => {
      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            errno: 102,
            code: 400,
            message: 'Unknown account',
          }),
          { status: 400 }
        );
      try {
        await httpClient.accountStatus('0123456789abcdef');
      } catch {}
      assert.equal(capturedMessages.length, 0);
    });

    it('does not manually capture a non-ok response to Sentry', async () => {
      globalThis.fetch = async () => new Response('{}', { status: 500 });
      try {
        await httpClient.accountStatus('0123456789abcdef');
      } catch {}
      assert.equal(capturedMessages.length, 0);
    });

    it('does not manually capture an unexpected error to Sentry', async () => {
      globalThis.fetch = async () => {
        throw new Error('Network failure');
      };
      try {
        await httpClient.accountStatus('0123456789abcdef');
      } catch {}
      assert.equal(capturedMessages.length, 0);
    });

    describe('WAF-blocked response (406/429 with non-JSON body)', () => {
      it('throws errno 125 with status 406 when body is not JSON', async () => {
        globalThis.fetch = async () =>
          new Response('<html>Blocked</html>', { status: 406 });
        let caught: any;
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch (e) {
          caught = e;
        }
        assert.equal(caught?.errno, 125);
        assert.equal(caught?.code, 406);
      });

      it('throws errno 114 with status 429 when body is not JSON', async () => {
        globalThis.fetch = async () =>
          new Response('rate limited', { status: 429 });
        let caught: any;
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch (e) {
          caught = e;
        }
        assert.equal(caught?.errno, 114);
        assert.equal(caught?.code, 429);
      });

      it('still rethrows the parse error on non-2xx with non-JSON body and a non-WAF status', async () => {
        globalThis.fetch = async () =>
          new Response('<html>Server Error</html>', { status: 500 });
        let caught: any;
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch (e) {
          caught = e;
        }
        // Falls through to the catch block as an unexpected error — preserves prior behavior.
        assert.ok(caught instanceof SyntaxError);
      });

      it('preserves auth server errno when 429 response has a JSON body with errno', async () => {
        // The auth server itself can return 429 with errno 114 and a retryAfter.
        // We must not override that with our synthesized WAF mapping.
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              errno: 114,
              code: 429,
              message: 'Client has sent too many requests',
              retryAfter: 30,
            }),
            { status: 429 }
          );
        let caught: any;
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch (e) {
          caught = e;
        }
        assert.equal(caught?.errno, 114);
        assert.equal(caught?.retryAfter, 30);
      });
    });
  });
});
