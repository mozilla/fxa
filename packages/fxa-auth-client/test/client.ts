/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as assert from 'assert';
import AuthClient from '../server';
import * as crypto from '../lib/crypto';

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

  describe('Sentry error capturing in request()', () => {
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

    it('does not call captureMessage on a successful response', async () => {
      globalThis.fetch = async () =>
        new Response('{"exists":true}', { status: 200 });
      await httpClient.accountStatus('0123456789abcdef');
      assert.equal(capturedMessages.length, 0);
    });

    describe('known errno response', () => {
      beforeEach(() => {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              errno: 102,
              code: 400,
              message: 'Unknown account',
            }),
            { status: 400 }
          );
      });

      it('calls captureMessage with the known-error message', async () => {
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(capturedMessages.length, 1);
        assert.ok(
          capturedMessages[0].message.includes('known error response'),
          `expected "known error response" in "${capturedMessages[0].message}"`
        );
      });

      it('tags the capture with path, method, errno, and code', async () => {
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        const { tags } = capturedMessages[0].context;
        assert.ok(
          (tags.path as string).includes('/account/status'),
          `expected path to include /account/status, got "${tags.path}"`
        );
        assert.equal(typeof tags.method, 'string');
        assert.equal(tags.errno, 102);
        assert.equal(tags.code, 400);
      });

      it('does not call captureMessage a second time from the catch block', async () => {
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(capturedMessages.length, 1);
      });
    });

    describe('non-ok response without errno', () => {
      beforeEach(() => {
        globalThis.fetch = async () => new Response('{}', { status: 500 });
      });

      it('calls captureMessage with the non-ok message', async () => {
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(capturedMessages.length, 1);
        assert.ok(
          capturedMessages[0].message.includes('non-ok response'),
          `expected "non-ok response" in "${capturedMessages[0].message}"`
        );
      });

      it('tags the capture with path, method, and HTTP status', async () => {
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        const { tags } = capturedMessages[0].context;
        assert.ok(
          (tags.path as string).includes('/account/status'),
          `expected path to include /account/status, got "${tags.path}"`
        );
        assert.equal(typeof tags.method, 'string');
        assert.equal(tags.status, 500);
      });

      it('does not call captureMessage a second time from the catch block', async () => {
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(capturedMessages.length, 1);
      });
    });

    describe('unexpected error (fetch throws)', () => {
      it('calls captureMessage with the unexpected-error message when fetch throws an Error', async () => {
        globalThis.fetch = async () => {
          throw new Error('Network failure');
        };
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(capturedMessages.length, 1);
        assert.ok(
          capturedMessages[0].message.includes('unexpected error'),
          `expected "unexpected error" in "${capturedMessages[0].message}"`
        );
      });

      it('includes the error message in extra when fetch throws an Error', async () => {
        globalThis.fetch = async () => {
          throw new Error('Network failure');
        };
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(
          capturedMessages[0].context.extra.message,
          'Network failure'
        );
      });

      it('uses "unknown error" in extra when fetch throws a non-Error value', async () => {
        globalThis.fetch = async () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw 'plain string error';
        };
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(
          capturedMessages[0].context.extra.message,
          'unknown error'
        );
      });

      it('tags the capture with path and method', async () => {
        globalThis.fetch = async () => {
          throw new Error('timeout');
        };
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        const { tags } = capturedMessages[0].context;
        assert.ok(
          (tags.path as string).includes('/account/status'),
          `expected path to include /account/status, got "${tags.path}"`
        );
        assert.equal(typeof tags.method, 'string');
      });
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

  describe('original-account-email credential derivation', () => {
    const SESSION_TOKEN = 'a'.repeat(64);
    const KEY_FETCH_TOKEN = 'b'.repeat(64);
    const PASSWORD_CHANGE_TOKEN = 'c'.repeat(64);
    const ORIGINAL_EMAIL = 'original@example.com';
    const PRIMARY_EMAIL = 'primary@example.com';

    let authClient: AuthClient;
    let originalFetch: typeof globalThis.fetch;
    let requests: Array<{
      method: string;
      path: string;
      body: any;
      headers?: Headers;
    }>;
    let getCredentialsCalls: Array<{ email: string; password: string }>;

    // Captured once so afterEach can restore the real implementations.
    const realGetCredentials = (crypto as any).getCredentials;
    const realUnwrapKB = (crypto as any).unwrapKB;
    const realUnbundle = (crypto as any).unbundleKeyFetchResponse;

    // Route a request by `METHOD /suffix`; the client prepends `/v1` to paths.
    function mockFetch(
      routes: Record<string, { status?: number; json?: any }>
    ) {
      globalThis.fetch = (async (url: string, init?: RequestInit) => {
        const { pathname } = new URL(url);
        const method = init?.method || 'GET';
        const body = init?.body
          ? JSON.parse(init.body as string)
          : undefined;
        requests.push({
          method,
          path: pathname,
          body,
          headers: init?.headers as Headers,
        });

        const matchKey = Object.keys(routes).find((key) => {
          const [routeMethod, routePath] = key.split(' ');
          return routeMethod === method && pathname.endsWith(routePath);
        });
        const { status = 200, json = {} } = matchKey ? routes[matchKey] : {};
        return new Response(JSON.stringify(json), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      }) as typeof globalThis.fetch;
    }

    function requestsTo(method: string, pathSuffix: string) {
      return requests.filter(
        (r) => r.method === method && r.path.endsWith(pathSuffix)
      );
    }

    beforeEach(() => {
      authClient = new AuthClient('http://localhost:9000');
      requests = [];
      getCredentialsCalls = [];
      originalFetch = globalThis.fetch;

      // Stub crypto so we (a) skip slow PBKDF2 stretching and (b) can assert
      // exactly which email salts each derivation — the heart of this change.
      // bearer/hawk token derivation still uses the real WebCrypto, so the
      // *_TOKEN constants above must remain valid hex.
      (crypto as any).getCredentials = async (
        email: string,
        password: string
      ) => {
        getCredentialsCalls.push({ email, password });
        return { authPW: `authPW-${email}`, unwrapBKey: `unwrapBKey-${email}` };
      };
      (crypto as any).unbundleKeyFetchResponse = async () => ({
        kA: 'kA',
        wrapKB: 'wrapKB',
      });
      (crypto as any).unwrapKB = () => 'unwrapped';
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
      (crypto as any).getCredentials = realGetCredentials;
      (crypto as any).unwrapKB = realUnwrapKB;
      (crypto as any).unbundleKeyFetchResponse = realUnbundle;
    });

    describe('sessionReauth', () => {
      it('fetches the original email and maps it onto the wire payload when originalLoginEmail is not supplied', async () => {
        mockFetch({
          'GET /session/original-account-email': {
            json: { email: ORIGINAL_EMAIL },
          },
          'POST /session/reauth': { json: { uid: 'uid', authAt: 1 } },
        });

        await authClient.sessionReauth(SESSION_TOKEN, PRIMARY_EMAIL, 'pw');

        // The signup (derivation) email is fetched exactly once...
        assert.equal(
          requestsTo('GET', '/session/original-account-email').length,
          1
        );
        // ...and used to derive credentials.
        assert.equal(getCredentialsCalls.length, 1);
        assert.equal(getCredentialsCalls[0].email, ORIGINAL_EMAIL);

        // payload.email is the derivation email; payload.originalLoginEmail is
        // the typed/current primary checked server-side against the account.
        const [reauth] = requestsTo('POST', '/session/reauth');
        assert.equal(reauth.body.email, ORIGINAL_EMAIL);
        assert.equal(reauth.body.originalLoginEmail, PRIMARY_EMAIL);
      });

      it('skips the extra round-trip when originalLoginEmail is pre-supplied', async () => {
        mockFetch({
          'POST /session/reauth': { json: { uid: 'uid', authAt: 1 } },
        });

        await authClient.sessionReauth(SESSION_TOKEN, PRIMARY_EMAIL, 'pw', {
          originalLoginEmail: ORIGINAL_EMAIL,
        });

        assert.equal(
          requestsTo('GET', '/session/original-account-email').length,
          0
        );
        assert.equal(getCredentialsCalls[0].email, ORIGINAL_EMAIL);

        const [reauth] = requestsTo('POST', '/session/reauth');
        assert.equal(reauth.body.email, ORIGINAL_EMAIL);
        assert.equal(reauth.body.originalLoginEmail, PRIMARY_EMAIL);
      });

      it('relays the derived unwrapBKey when keys are requested', async () => {
        mockFetch({
          'POST /session/reauth': { json: { uid: 'uid', authAt: 1 } },
        });

        const accountData = await authClient.sessionReauth(
          SESSION_TOKEN,
          PRIMARY_EMAIL,
          'pw',
          { keys: true, originalLoginEmail: ORIGINAL_EMAIL }
        );

        assert.equal(accountData.unwrapBKey, `unwrapBKey-${ORIGINAL_EMAIL}`);
      });

      it('propagates an incorrect-email-case error without retrying (case lookahead removed)', async () => {
        mockFetch({
          'GET /session/original-account-email': {
            json: { email: ORIGINAL_EMAIL },
          },
          'POST /session/reauth': {
            status: 400,
            json: {
              errno: 120,
              code: 400,
              email: 'CASED@example.com',
              message: 'Incorrect email case',
            },
          },
        });

        let caught: any;
        try {
          await authClient.sessionReauth(SESSION_TOKEN, PRIMARY_EMAIL, 'pw');
        } catch (e) {
          caught = e;
        }

        assert.equal(caught?.errno, 120);
        // The old flow retried the reauth with the server-corrected email; the
        // new flow derives from the original email up front, so there is no retry.
        assert.equal(requestsTo('POST', '/session/reauth').length, 1);
      });
    });

    describe('passwordChange', () => {
      it('derives every v1 credential from the original signup email', async () => {
        mockFetch({
          'GET /session/original-account-email': {
            json: { email: ORIGINAL_EMAIL },
          },
          'POST /password/change/start': {
            json: {
              keyFetchToken: KEY_FETCH_TOKEN,
              passwordChangeToken: PASSWORD_CHANGE_TOKEN,
            },
          },
          'GET /account/keys': { json: { bundle: '00' } },
          'POST /password/change/finish': {
            json: { uid: 'uid', sessionToken: SESSION_TOKEN, authAt: 1 },
          },
        });

        await authClient.passwordChange(
          PRIMARY_EMAIL,
          'oldpw',
          'newpw',
          SESSION_TOKEN
        );

        assert.equal(
          requestsTo('GET', '/session/original-account-email').length,
          1
        );
        // /password/change/start is salted/looked-up by the original email.
        const [start] = requestsTo('POST', '/password/change/start');
        assert.equal(start.body.email, ORIGINAL_EMAIL);
        // No derivation ever uses the typed primary email.
        assert.ok(
          getCredentialsCalls.every((c) => c.email === ORIGINAL_EMAIL),
          `expected all getCredentials calls to use ${ORIGINAL_EMAIL}, got ${JSON.stringify(
            getCredentialsCalls
          )}`
        );
      });
    });

    describe('passwordChangeWithJWT', () => {
      it('fetches the original email once and uses it for reauth and the JWT change payload', async () => {
        mockFetch({
          'GET /session/original-account-email': {
            json: { email: ORIGINAL_EMAIL },
          },
          'POST /session/reauth': {
            json: { uid: 'uid', keyFetchToken: KEY_FETCH_TOKEN, authAt: 1 },
          },
          'GET /account/keys': { json: { bundle: '00' } },
          'POST /mfa/password/change': {
            json: { uid: 'uid', sessionToken: SESSION_TOKEN, authAt: 1 },
          },
        });

        await authClient.passwordChangeWithJWT(
          'jwt-token',
          PRIMARY_EMAIL,
          'oldpw',
          'newpw',
          SESSION_TOKEN
        );

        // Fetched once at the top — sessionReauth reuses it via originalLoginEmail
        // instead of issuing a redundant round-trip.
        assert.equal(
          requestsTo('GET', '/session/original-account-email').length,
          1
        );

        const [reauth] = requestsTo('POST', '/session/reauth');
        assert.equal(reauth.body.email, ORIGINAL_EMAIL);
        assert.equal(reauth.body.originalLoginEmail, PRIMARY_EMAIL);

        const [change] = requestsTo('POST', '/mfa/password/change');
        assert.equal(change.body.email, ORIGINAL_EMAIL);
        assert.ok(change.body.oldAuthPW, 'expected oldAuthPW in payload');
        assert.ok(change.body.authPW, 'expected authPW in payload');
        assert.equal(
          change.headers?.get('authorization'),
          'Bearer jwt-token'
        );

        assert.ok(
          getCredentialsCalls.every((c) => c.email === ORIGINAL_EMAIL),
          `expected all getCredentials calls to use ${ORIGINAL_EMAIL}, got ${JSON.stringify(
            getCredentialsCalls
          )}`
        );
      });
    });
  });
});
