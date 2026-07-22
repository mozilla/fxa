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

  describe('v1 credential salt fallback (signup email !== primary email)', () => {
    let saltClient: AuthClient;
    let originalFetch: typeof globalThis.fetch;
    let calls: Array<{ url: string; body: any }>;
    let responses: Array<() => Response>;

    const sessionToken = '00'.repeat(32);
    const password = 'hunter2hunter2';
    const signupEmail = 'signup@example.com';
    const primaryEmail = 'primary@example.com';

    const emailCaseError = (correctedEmail: string) =>
      new Response(
        JSON.stringify({
          errno: 120,
          code: 400,
          error: 'Bad Request',
          message: 'Incorrect email case',
          email: correctedEmail,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    const ok = (json: Record<string, any> = {}) =>
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    before(() => {
      saltClient = new AuthClient('http://localhost:9000');
    });

    beforeEach(() => {
      originalFetch = globalThis.fetch;
      calls = [];
      responses = [];
      globalThis.fetch = (async (url: string, init?: RequestInit) => {
        calls.push({
          url: String(url),
          body: init?.body ? JSON.parse(init.body as string) : undefined,
        });
        const next = responses.shift();
        return next ? next() : ok();
      }) as typeof globalThis.fetch;
    });

    afterEach(() => {
      globalThis.fetch = originalFetch;
    });

    it('sessionReauth: falls back to the signup email salt after INCORRECT_EMAIL_CASE', async () => {
      responses = [() => emailCaseError(signupEmail), () => ok({ uid: 'abc' })];

      const result = await saltClient.sessionReauth(
        sessionToken,
        { primary: primaryEmail, original: signupEmail },
        password
      );

      assert.equal(calls.length, 2);
      // The account is always identified by its primary email; only the salt varies.
      assert.equal(calls[0].body.email, primaryEmail);
      assert.equal(calls[1].body.email, primaryEmail);
      // First attempt derives authPW from the primary, the retry from the signup email.
      const primaryAuthPW = (
        await crypto.getCredentials(primaryEmail, password)
      ).authPW;
      const signupAuthPW = (await crypto.getCredentials(signupEmail, password))
        .authPW;
      assert.equal(calls[0].body.authPW, primaryAuthPW);
      assert.equal(calls[1].body.authPW, signupAuthPW);
      assert.notEqual(calls[0].body.authPW, calls[1].body.authPW);
      assert.equal((result as any).uid, 'abc');
    });

    it('sessionReauth: primary-salted account (signup !== primary) succeeds on the first attempt with no fallback', async () => {
      // The reported-bug population: the verifier is salted with the primary
      // email (e.g. a password reset that followed a primary-email swap). The
      // primary-salted first attempt succeeds, so there is no second request.
      responses = [() => ok({ uid: 'abc' })];

      const result = await saltClient.sessionReauth(
        sessionToken,
        { primary: primaryEmail, original: signupEmail },
        password
      );

      assert.equal(calls.length, 1);
      assert.equal(calls[0].body.email, primaryEmail);
      const primaryAuthPW = (
        await crypto.getCredentials(primaryEmail, password)
      ).authPW;
      assert.equal(calls[0].body.authPW, primaryAuthPW);
      assert.equal((result as any).uid, 'abc');
    });

    it('sessionReauth: makes a single request for a normal account (signup === primary)', async () => {
      responses = [() => ok({ uid: 'abc' })];

      const result = await saltClient.sessionReauth(
        sessionToken,
        primaryEmail,
        password
      );

      assert.equal(calls.length, 1);
      assert.equal(calls[0].body.email, primaryEmail);
      // The salt is the primary email, which is also the signup email here.
      const primaryAuthPW = (
        await crypto.getCredentials(primaryEmail, password)
      ).authPW;
      assert.equal(calls[0].body.authPW, primaryAuthPW);
      assert.equal((result as any).uid, 'abc');
    });

    it('sessionReauth: does not fall back on a non-email-case error', async () => {
      responses = [
        () =>
          new Response(
            JSON.stringify({
              errno: 103,
              code: 400,
              message: 'Incorrect password',
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          ),
      ];

      let caught: any;
      try {
        await saltClient.sessionReauth(
          sessionToken,
          { primary: primaryEmail, original: signupEmail },
          password
        );
      } catch (e) {
        caught = e;
      }

      assert.equal(calls.length, 1);
      assert.equal(caught?.errno, 103);
    });

    it('accountDestroy: falls back to the signup email salt after INCORRECT_EMAIL_CASE', async () => {
      responses = [() => emailCaseError(signupEmail), () => ok({})];

      await saltClient.accountDestroy(
        { primary: primaryEmail, original: signupEmail },
        password,
        {},
        sessionToken
      );

      assert.equal(calls.length, 2);
      assert.equal(calls[0].body.email, primaryEmail);
      assert.equal(calls[1].body.email, primaryEmail);
      const primaryAuthPW = (
        await crypto.getCredentials(primaryEmail, password)
      ).authPW;
      const signupAuthPW = (await crypto.getCredentials(signupEmail, password))
        .authPW;
      assert.equal(calls[0].body.authPW, primaryAuthPW);
      assert.equal(calls[1].body.authPW, signupAuthPW);
    });

    it('passwordChangeWithJWT: falls back to the signup email salt, and the change payload keeps the signup email', async () => {
      // Stub the key-bundle fetch/derivation so the test can focus on the salt
      // fallback rather than a real /account/keys crypto bundle.
      const origAccountKeys = saltClient.accountKeys;
      (saltClient as any).accountKeys = async () => ({
        kA: '11'.repeat(32),
        kB: '22'.repeat(32),
      });

      try {
        responses = [
          () => emailCaseError(signupEmail), // reauth attempt 1 (primary salt) fails
          () => ok({ keyFetchToken: '33'.repeat(32) }), // reauth attempt 2 (signup salt) ok
          () => ok({ uid: 'abc' }), // /mfa/password/change
        ];

        const result = await saltClient.passwordChangeWithJWT(
          'fake.jwt.token',
          { primary: primaryEmail, original: signupEmail },
          password,
          'newpassword9newpassword9',
          sessionToken
        );

        const primaryAuthPW = (
          await crypto.getCredentials(primaryEmail, password)
        ).authPW;
        const signupAuthPW = (
          await crypto.getCredentials(signupEmail, password)
        ).authPW;

        // reauth (fails) -> reauth (ok) -> change.
        assert.equal(calls.length, 3);
        // Both reauth attempts identify by the primary email; the salt flips
        // primary -> signup between them.
        assert.ok(calls[0].url.includes('/session/reauth'));
        assert.equal(calls[0].body.email, primaryEmail);
        assert.equal(calls[0].body.authPW, primaryAuthPW);
        assert.ok(calls[1].url.includes('/session/reauth'));
        assert.equal(calls[1].body.email, primaryEmail);
        assert.equal(calls[1].body.authPW, signupAuthPW);
        // The change payload keeps the signup email (so the server's match against
        // accounts.email holds) with the matching signup-derived oldAuthPW.
        assert.ok(calls[2].url.includes('/mfa/password/change'));
        assert.equal(calls[2].body.email, signupEmail);
        assert.equal(calls[2].body.oldAuthPW, signupAuthPW);
        assert.equal((result as any).uid, 'abc');
      } finally {
        (saltClient as any).accountKeys = origAccountKeys;
      }
    });

    it('passwordChangeWithJWT: primary-salted account (signup !== primary) succeeds on the first attempt with no fallback', async () => {
      // The reported-bug population: the verifier is salted with the primary
      // email. The primary-salted reauth succeeds immediately, and the change
      // payload keeps the signup email with the primary-derived oldAuthPW.
      const origAccountKeys = saltClient.accountKeys;
      (saltClient as any).accountKeys = async () => ({
        kA: '11'.repeat(32),
        kB: '22'.repeat(32),
      });

      try {
        responses = [
          () => ok({ keyFetchToken: '33'.repeat(32) }), // reauth attempt 1 (primary salt) ok
          () => ok({ uid: 'abc' }), // /mfa/password/change
        ];

        const result = await saltClient.passwordChangeWithJWT(
          'fake.jwt.token',
          { primary: primaryEmail, original: signupEmail },
          password,
          'newpassword9newpassword9',
          sessionToken
        );

        const primaryAuthPW = (
          await crypto.getCredentials(primaryEmail, password)
        ).authPW;

        // reauth (ok) -> change; no fallback.
        assert.equal(calls.length, 2);
        assert.ok(calls[0].url.includes('/session/reauth'));
        assert.equal(calls[0].body.email, primaryEmail);
        assert.equal(calls[0].body.authPW, primaryAuthPW);
        assert.ok(calls[1].url.includes('/mfa/password/change'));
        assert.equal(calls[1].body.email, signupEmail);
        assert.equal(calls[1].body.oldAuthPW, primaryAuthPW);
        assert.equal((result as any).uid, 'abc');
      } finally {
        (saltClient as any).accountKeys = origAccountKeys;
      }
    });
  });
});
