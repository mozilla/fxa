/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert');
const fs = require('fs');
const { STATUS_CODES } = require('http');

const config = require('../../lib/config');
fs.mkdirSync(config.get('img.uploads.dest.public'), { recursive: true });

const OAUTH_VERIFY_URL = config.get('oauth.url') + '/verify';
const AUTH_PROFILE_URL = config.get('authServer.url') + '/account/profile';
const WORKER_AVATAR_URL = new RegExp(
  '^' +
    config.get('worker.url').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
    '/a/[0-9a-f]{32}$'
);

// Gather a request body, which may be a hapi payload stream on upload.
async function readBody(body) {
  if (body == null) {
    return Buffer.alloc(0);
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (typeof body === 'string') {
    return Buffer.from(body);
  }
  const chunks = [];
  for await (const chunk of body) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function reply(status, body) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(status === 204 || body == null ? null : text, {
    status,
    statusText: STATUS_CODES[status] || '',
    headers: { 'content-type': 'application/json' },
  });
}

module.exports = async function mock(options) {
  const WORKER = await require('../../lib/server/worker').create();

  assert(options.userid);
  const TOKEN_GOOD = JSON.stringify({
    user: options.userid,
    scope: ['profile'],
  });

  // Each entry matches at most one request, and `done()` asserts it was used.
  let outstanding = [];

  function intercept(spec) {
    const entry = Object.assign({ called: false }, spec);
    entry.done = function () {
      assert(entry.called, 'Mock never called: ' + spec.describe);
    };
    outstanding.push(entry);
    return entry;
  }

  global.fetch = async function mockFetch(input, init) {
    init = init || {};
    const reqUrl = typeof input === 'string' ? input : String(input.url);
    const method = (init.method || 'GET').toUpperCase();
    const entry = outstanding.find(
      (e) => !e.called && e.method === method && e.matches(reqUrl)
    );
    if (!entry) {
      throw new Error('Unexpected request: ' + method + ' ' + reqUrl);
    }
    entry.called = true;
    return entry.respond(reqUrl, init);
  };

  function interceptVerify(status, body) {
    return intercept({
      method: 'POST',
      describe: 'oauth /verify',
      matches: (u) => u === OAUTH_VERIFY_URL,
      respond: () => reply(status, body),
    });
  }

  function interceptProfile(status, body) {
    return intercept({
      method: 'GET',
      describe: 'auth-server /account/profile',
      matches: (u) => u === AUTH_PROFILE_URL,
      respond: () => reply(status, body),
    });
  }

  // Hands the uploaded bytes to the real worker, so the image pipeline still
  // runs and the resized files land where later assertions look for them.
  function worker(bytes) {
    return intercept({
      method: 'POST',
      describe: 'image worker upload',
      matches: (u) => WORKER_AVATAR_URL.test(u),
      respond: async (reqUrl, init) => {
        const headers = new Headers(init.headers || {});
        assert.strictEqual(headers.get('content-type'), 'image/png');
        assert.strictEqual(headers.get('content-length'), String(bytes));
        const res = await WORKER.inject({
          method: 'POST',
          url: new URL(reqUrl).pathname,
          payload: await readBody(init.body),
          headers: Object.fromEntries(headers.entries()),
        });
        return reply(res.statusCode, res.payload);
      },
    });
  }

  return {
    done: function done() {
      // Reset even if a mock assertion throws, so one failing test cannot
      // leave stale mocks that cascade into every later test's teardown.
      try {
        outstanding.forEach(function (mock) {
          mock.done();
        });
      } finally {
        outstanding = [];
      }
    },

    tokenGood: function tokenGood() {
      return interceptVerify(200, TOKEN_GOOD);
    },

    token: function token(tok) {
      return interceptVerify(200, JSON.stringify(tok));
    },

    tokenFailure: function tokenFailure() {
      return interceptVerify(500, null);
    },

    email: function mockEmail(email) {
      return interceptProfile(200, { email: email });
    },

    subscriptions: function mockSubscriptions(subscriptions) {
      return interceptProfile(200, { subscriptions });
    },

    profileChangedAt: function mockProfileChangedAt(email, profileChangedAt) {
      return interceptProfile(200, { email: email, profileChangedAt });
    },

    emailFailure: function mockEmailFailure(body) {
      body = body || {};
      return interceptProfile(body.code || 500, body);
    },

    coreProfile: function mockEmail(body) {
      return interceptProfile(200, body);
    },

    workerFailure: function workerFailure(action, bytes, response) {
      if (action !== 'post' && action !== 'delete') {
        throw new Error('failure must be post or delete');
      }
      if (bytes == null) {
        throw new Error('Content-Length argument required');
      }
      return intercept({
        method: action.toUpperCase(),
        describe: 'image worker ' + action + ' failure',
        matches: (u) => WORKER_AVATAR_URL.test(u),
        respond: (reqUrl, init) => {
          if (action === 'post') {
            const headers = new Headers(init.headers || {});
            assert.strictEqual(headers.get('content-type'), 'image/png');
            assert.strictEqual(headers.get('content-length'), String(bytes));
          }
          return reply(500, response || 'unexpected server error');
        },
      });
    },

    image: function image(bytes) {
      worker(bytes);
    },

    deleteImage: function deleteImage() {
      intercept({
        method: 'DELETE',
        describe: 'image worker delete',
        matches: (u) => WORKER_AVATAR_URL.test(u),
        respond: async (reqUrl) => {
          const res = await WORKER.inject({
            method: 'DELETE',
            url: new URL(reqUrl).pathname,
          });
          return reply(res.statusCode, res.payload);
        },
      });
    },

    log: function mockLog(logger, cb) {
      var root = require('../../lib/logging')();
      var log = require('../../lib/logging')(logger);
      log.setLevel('verbose');
      var isDone = false;
      var filter = {
        filter: function (record) {
          if (cb(record)) {
            isDone = true;
            log.removeFilter(filter);
            log.setLevel(root.getEffectiveLevel());
            return false;
          }
          return true;
        },
      };
      log.addFilter(filter);
      outstanding.push({
        done: function done() {
          assert(isDone, 'Mocked logger never called: ' + logger);
        },
      });
    },
  };
};
