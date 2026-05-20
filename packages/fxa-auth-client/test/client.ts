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

  describe('Sentry error capturing in request()', () => {
    let httpClient: AuthClient;
    let originalFetch: typeof globalThis.fetch;
    let originalCaptureMessage: (...args: any[]) => any;
    let capturedMessages: Array<{ message: string; context: Record<string, any> }>;

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
            JSON.stringify({ errno: 102, code: 400, message: 'Unknown account' }),
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
        globalThis.fetch = async () =>
          new Response('{}', { status: 500 });
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
        assert.equal(capturedMessages[0].context.extra.message, 'Network failure');
      });

      it('uses "unknown error" in extra when fetch throws a non-Error value', async () => {
        globalThis.fetch = async () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw 'plain string error';
        };
        try {
          await httpClient.accountStatus('0123456789abcdef');
        } catch {}
        assert.equal(capturedMessages[0].context.extra.message, 'unknown error');
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
  });
});
