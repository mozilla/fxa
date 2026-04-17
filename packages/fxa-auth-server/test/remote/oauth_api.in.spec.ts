/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Firestore BulkWriter crashes on CI clock jitter. Tolerate backward time jumps.
const RateLimiter =
  require('@google-cloud/firestore/build/src/rate-limiter').RateLimiter;
const _origRefill = RateLimiter.prototype.refillTokens;
RateLimiter.prototype.refillTokens = function (requestTimeMillis: number) {
  if (requestTimeMillis < this.lastRefillTimeMillis) {
    return;
  }
  return _origRefill.call(this, requestTimeMillis);
};

// Mock ESM-only packages to avoid Jest parse errors when loading server in-process
jest.mock('@octokit/rest', () => ({ Octokit: jest.fn() }));
jest.mock('p-queue', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    add: jest.fn((fn: any) => fn()),
    onSizeLessThan: jest.fn().mockResolvedValue(undefined),
    onIdle: jest.fn().mockResolvedValue(undefined),
    onEmpty: jest.fn().mockResolvedValue(undefined),
    concurrency: 0,
  })),
}));

const url = require('url');
const nock = require('nock');
const buf = (v) => (Buffer.isBuffer(v) ? v : Buffer.from(v, 'hex'));
const testServer = require('../lib/server');
const ScopeSet = require('fxa-shared').oauth.scopes;
const { decodeJWT } = require('../lib/util');
import sinon from 'sinon';

const db = require('../../lib/oauth/db');
const encrypt = require('fxa-shared/auth/encrypt');
const config = testServer.config;
const util2 = require('util');

const unique = require('../../lib/oauth/unique');
const util = require('../../lib/oauth/util');
const validators = require('../../lib/oauth/validators');
const jwt = require('jsonwebtoken');
const jwtSign = util2.promisify(jwt.sign);

const assertSecurityHeaders = require('../lib/util').assertSecurityHeaders;

const USERID = unique(16).toString('hex');
const VEMAIL = unique(4).toString('hex') + '@mozilla.com';
const AUTH_AT = Math.floor(Date.now() / 1000);
const AMR = ['pwd', 'email'];
const AAL = 1;
const ACR = 'AAL1';
const PROFILE_CHANGED_AT_LATER_TIME = AUTH_AT + 1000;
const JWT_IAT = Date.now();
const ISSUER = config.get('oauthServer.browserid.issuer');
const AUDIENCE = config.get('publicUrl');
const AUTH_SERVER_SECRETS = config.get('oauthServer.authServerSecrets');

const GOOD_CLAIMS = {
  'fxa-generation': 123456,
  'fxa-verifiedEmail': VEMAIL,
  'fxa-lastAuthAt': AUTH_AT,
  'fxa-tokenVerified': true,
  'fxa-amr': AMR,
  'fxa-aal': AAL,
};

const UNVERIFIED_CLAIMS = {
  'fxa-generation': 12345,
  'fxa-verifiedEmail': VEMAIL,
  'fxa-lastAuthAt': AUTH_AT,
  'fxa-tokenVerified': false,
  'fxa-amr': ['pwd', 'otp'],
  'fxa-aal': 2,
};

async function genAssertion(claims, sub?) {
  let options = {};
  claims = Object.assign(
    {
      iat: JWT_IAT,
      exp: JWT_IAT + 60,
      sub: sub || USERID,
      aud: AUDIENCE,
      iss: ISSUER,
    },
    claims
  );

  const key = AUTH_SERVER_SECRETS[0];

  options = Object.assign(
    {
      algorithm: 'HS256',
    },
    options
  );
  return await jwtSign(claims, key, options);
}

const MAX_TTL_S = config.get('oauthServer.expiration.accessToken') / 1000;

const SCOPED_CLIENT_ID = 'aaa6b9b3a65a1871';
const NO_KEY_SCOPES_CLIENT_ID = '38a6b9b3a65a1871';
const NO_ALLOWED_SCOPES_CLIENT_ID = '38a6b9b3a65a1872';
const BAD_CLIENT_ID = '0006b9b3a65a1871';
const SCOPE_CAN_SCOPE_KEY =
  'https://identity.mozilla.com/apps/sample-scope-can-scope-key';

// this matches the hashed secret in config, an assert sanity checks
// lower to make sure it matches
const secret =
  'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
const secretPrevious =
  'ec62e3281e3b56e702fe7e82ca7b1fa59d6c2a6766d6d28cccbf8bfa8d5fc8a8';

let client;
let badSecret;
let clientId;
let AN_ASSERTION;

function authParams(params?, options?) {
  options = options || {};
  const defaults = {
    assertion: AN_ASSERTION,
    client_id: options.clientId || clientId,
    state: '1',
    scope: 'profile',
    acr_values: options.acr_values || undefined,
  };

  params = params || {};
  Object.keys(params).forEach(function (key) {
    defaults[key] = params[key];
  });
  return defaults;
}

function assertInvalidRequestParam(result, param) {
  expect(result.code).toBe(400);
  expect(result.errno).toBe(109);
  expect(result.message).toBe('Invalid request parameter');
  expect(result.validation.keys.length).toBe(1);
  expect(result.validation.keys[0]).toBe(param);
}

// helper function to create a new user, email and token for some client
/**
 *
 * @param {Object} client - client object
 * @param {Object} [options] - custom options
 * @param {Object} [options.uid] - custom uid
 * @param {Object} [options.email] - custom email
 * @param {Object} [options.scopes] - custom scopes
 */
function clientByName(name) {
  return config
    .get('oauthServer.clients')
    .reduce(function (client, lastClient) {
      return client.name === name ? client : lastClient;
    });
}

function basicAuthHeader(clientId, secret) {
  return 'Basic ' + Buffer.from(clientId + ':' + secret).toString('base64');
}

describe('#integration - /v1', function () {
  let sandbox;
  let Server;

  function newToken(payload: any = {}, options: any = {}) {
    const ttl = payload.ttl || MAX_TTL_S;
    delete payload.ttl;
    return Server.api
      .post({
        url: '/authorization',
        payload: authParams(payload, options),
      })
      .then(function (res) {
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        return Server.api.post({
          url: '/token',
          payload: {
            client_id: options.clientId || clientId,
            client_secret: options.codeVerifier
              ? undefined
              : options.secret || secret,
            code: res.result.code,
            code_verifier: options.codeVerifier,
            ppid_seed: options.ppidSeed,
            resource: options.resource,
            ttl: ttl,
          },
        });
      });
  }

  beforeAll(async () => {
    Server = await testServer.start();
    expect(Server).toBeDefined();
    AN_ASSERTION = await genAssertion(GOOD_CLAIMS);
    await db.ping();
    client = clientByName('Mocha');
    clientId = client.id;
    expect(encrypt.hash(secret).toString('hex')).toBe(client.hashedSecret);
    expect(encrypt.hash(secretPrevious).toString('hex')).toBe(
      client.hashedSecretPrevious
    );
    badSecret = Buffer.from(secret, 'hex').slice();
    badSecret[badSecret.length - 1] ^= 1;
    badSecret = badSecret.toString('hex');
  });

  afterAll(async () => {
    await Server.close();
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(function () {
    nock.cleanAll();
    sandbox.restore();
  });

  describe('/authorization', function () {
    describe('GET', function () {
      it('redirects with all query params to /authorization', function () {
        return Server.api
          .get(
            '/authorization?client_id=123&state=321&scope=1&action=signup&a=b'
          )
          .then(function (res) {
            expect(res.statusCode).toBe(302);
            assertSecurityHeaders(res);
            const redirect = url.parse(res.headers.location, true);

            expect(redirect.query.action).toBe('signup');
            expect(redirect.query.client_id).toBe('123');
            expect(redirect.query.state).toBe('321');
            expect(redirect.query.scope).toBe('1');
            // unknown query params are forwarded
            expect(redirect.query.a).toBe('b');
            const target = url.parse(
              config.get('oauthServer.contentUrl'),
              true
            );
            expect(redirect.pathname).toBe('/authorization');
            expect(redirect.host).toBe(target.host);
          });
      });

      it('should fail if keys_jwk specified', () => {
        return Server.api
          .get('/authorization?keys_jwk=xyz&client_id=123&state=321&scope=1')
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'keys_jwk');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('content-type', function () {
      it('should fail if unsupported', function () {
        return Server.api
          .post({
            url: '/authorization',
            headers: {
              'content-type': 'text/plain',
            },
            payload: authParams(),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(415);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(113);
          });
      });
    });

    describe('untrusted client scope', function () {
      it('should fail if invalid scopes', function () {
        const client = clientByName('Untrusted');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile:write',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(114);
            expect(res.result.invalidScopes).toContain('profile:write');
          });
      });

      it('should report all invalid scopes', function () {
        const client = clientByName('Untrusted');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile:email profile:locale profile:amr',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(114);
            expect(res.result.invalidScopes).not.toContain('profile:email');
            expect(res.result.invalidScopes).toContain('profile:locale');
            expect(res.result.invalidScopes).toContain('profile:amr');
          });
      });

      it('should succeed if valid scope', function () {
        const client = clientByName('Untrusted');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile:email profile:uid',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
          });
      });

      it('should succeed with https:// scopes', function () {
        const scopes =
          'profile:email profile:uid https://identity.mozilla.com/apps/notes https://identity.mozilla.com/apps/lockbox';
        const client = clientByName('Mocha');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: scopes,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('pkce', function () {
      it('should fail if Public Client is not using code_challenge', function () {
        const client = clientByName('Public Client PKCE');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(118);
            expect(res.result.error).toBe('PKCE parameters missing');
          });
      });

      it('should allow Public Clients to direct grant without PKCE', function () {
        const client = clientByName('Admin');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              response_type: 'token',
              scope: 'profile',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
          });
      });

      it('only works with Public Clients', function () {
        const client = clientByName('Mocha');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile',
              response_type: 'code',
              code_challenge_method: 'S256',
              code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(116);
            expect(res.result.message).toBe('Not a public client');
          });
      });
    });

    describe('?client_id', function () {
      it('is required', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: undefined,
            }),
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'client_id');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?assertion', function () {
      it('is required', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              assertion: undefined,
            }),
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'assertion');
            assertSecurityHeaders(res);
          });
      });

      it('errors correctly if invalid', async function () {
        const assertion = await genAssertion(GOOD_CLAIMS);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              assertion: assertion + 'invalid',
            }),
          })
          .then(function (res) {
            expect(res.result.code).toBe(401);
            expect(res.result.message).toBe('Invalid assertion');
            assertSecurityHeaders(res);
          });
      });

      it('succeeds by default when fxa-tokenVerified is false', async function () {
        const assertion = await genAssertion(UNVERIFIED_CLAIMS);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              assertion,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
          });
      });

      it('errors when fxa-tokenVerified is false and a scope has keys', async function () {
        const assertion = await genAssertion(UNVERIFIED_CLAIMS);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              assertion,
              client_id: SCOPED_CLIENT_ID,
              scope: SCOPE_CAN_SCOPE_KEY,
            }),
          })
          .then(function (res) {
            expect(res.result.code).toBe(401);
            expect(res.result.message).toBe('Invalid assertion');
            assertSecurityHeaders(res);
          });
      });

      it('succeeds when fxa-tokenVerified is false and an unknown URL scope is requested', async function () {
        const assertion = await genAssertion(UNVERIFIED_CLAIMS);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              assertion,
              client_id: SCOPED_CLIENT_ID,
              scope: 'https://example.com/unknown-scope',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?redirect_uri', function () {
      it('is optional', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: client.redirectUri,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.redirect).toBeTruthy();
          });
      });

      it('must be same as registered redirect', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: 'http://localhost:8080/derp',
            }),
          })
          .then(function (res) {
            expect(res.result.code).toBe(400);
            expect(res.result.message).toBe('Incorrect redirect_uri');
            assertSecurityHeaders(res);
          });
      });

      it('can be a URN', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: '98e6508e88680e1b',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            const expected = 'urn:ietf:wg:oauth:2.0:fx:webchannel';
            const actual = res.result.redirect.substr(0, expected.length);
            expect(actual).toBe(expected);
          });
      });

      it('can have query parameters', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: 'dcdb5ae7add825d2',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            const expected = 'https://example.domain/return?foo=bar';
            const actual = res.result.redirect.substr(0, expected.length);
            expect(actual).toBe(expected);
          });
      });
    });

    describe('?state', function () {
      it('is required', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              state: undefined,
            }),
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'state');
            assertSecurityHeaders(res);
          });
      });

      it('is returned', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              state: 'aa',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.state).toBe('aa');
            expect(url.parse(res.result.redirect, true).query.state).toBe('aa');
          });
      });
    });

    describe('?scope', function () {
      it('is required', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: undefined,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
          });
      });

      it('is restricted to expected characters', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: 'profile:\u2603',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?resource', () => {
      it('should fail at /authorization', async () => {
        const res = await Server.api.post({
          url: '/authorization',
          payload: authParams({
            client_id: client.id,
            scope: 'profile profile:write profile:uid',
            response_type: 'code',
            resource: 'https://resource.server.com',
          }),
        });

        expect(res.statusCode).toBe(400);
        expect(res.result.errno).toBe(109);
      });

      it('should fail at /token with hash parameters', async () => {
        const jwtClient = clientByName('JWT Client');
        expect(jwtClient.canGrant).toBeTruthy(); //sanity check
        const clientId = jwtClient.id;
        const res = await newToken(
          {
            access_type: 'offline',
          },
          {
            clientId: clientId,
            resource: 'https://resource.server.com/#hash=1',
          }
        );

        expect(res.statusCode).toBe(400);
        expect(res.result.errno).toBe(109);
      });
    });

    describe('?response_type', function () {
      it('is optional', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: undefined,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.redirect).toBeTruthy();
          });
      });

      it('can be code', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'code',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.code).toBeTruthy();
            expect(res.result.redirect).toBeTruthy();
          });
      });

      it('supports PKCE - code_challenge and code_challenge_method', function () {
        const client = clientByName('Public Client PKCE');
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              response_type: 'code',
              code_challenge_method: 'S256',
              code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.code).toBeTruthy();
            expect(res.result.redirect).toBeTruthy();
          });
      });

      it('supports code_challenge only with code response_type', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'token',
              code_challenge_method: 'S256',
              code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            expect(res.result.errno).toBe(109);
          });
      });

      it('must not be something besides code or token', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'foo',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
          });
      });

      it('fails if ttl is specified with code', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'code',
              ttl: 42,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
          });
      });

      describe('token', function () {
        const client2 = clientByName('Admin');
        expect(client2.canGrant).toBeTruthy(); //sanity check
        const jwtClient = clientByName('JWT Client');
        expect(jwtClient.canGrant).toBeTruthy(); //sanity check
        const ppidClient = clientByName('PPID JWT Client');
        expect(ppidClient.canGrant).toBeTruthy(); //sanity check

        it('does not require state argument', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                state: undefined,
                response_type: 'token',
              }),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
            });
        });

        it('requires scope argument', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                scope: undefined,
                response_type: 'token',
              }),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(400);
            });
        });

        it('requires a client with proper permission', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client.id,
                response_type: 'token',
              }),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(400);
              assertSecurityHeaders(res);
              expect(res.result.errno).toBe(110);
            });
        });

        it('returns an implicit token', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                response_type: 'token',
              }),
            })
            .then(function (res) {
              const defaultExpiresIn =
                config.get('oauthServer.expiration.accessToken') / 1000;
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.access_token).toBeTruthy();
              expect(res.result.token_type).toBe('bearer');
              expect(res.result.scope).toBeTruthy();
              expect(res.result.expires_in <= defaultExpiresIn).toBeTruthy();
              expect(
                res.result.expires_in > defaultExpiresIn - 10
              ).toBeTruthy();
              expect(res.result.auth_at).toBeTruthy();
            });
        });

        it('returns an JWT formatted token in the implicit grant flow', async function () {
          const res = await Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: jwtClient.id,
              response_type: 'token',
              resource: 'https://resource.server.com',
            }),
          });

          const defaultExpiresIn =
            config.get('oauthServer.expiration.accessToken') / 1000;
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.access_token).toBeTruthy();
          expect(
            validators.jwt.validate(res.result.access_token).error
          ).toBeUndefined();
          const jwt = decodeJWT(res.result.access_token);
          expect(jwt.claims.sub).toBe(USERID);
          expect(jwt.claims.aud).toEqual([
            jwtClient.id,
            'https://resource.server.com',
          ]);

          expect(res.result.token_type).toBe('bearer');
          expect(res.result.scope).toBeTruthy();
          expect(res.result.expires_in <= defaultExpiresIn).toBeTruthy();
          expect(res.result.expires_in > defaultExpiresIn - 10).toBeTruthy();
          expect(res.result.auth_at).toBeTruthy();
        });

        it('honours the ttl parameter', function () {
          const ttl = 42;
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                response_type: 'token',
                ttl: ttl,
              }),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.expires_in <= ttl).toBeTruthy();
              expect(res.result.expires_in > ttl - 10).toBeTruthy();
            });
        });

        it('allows an arbitrarily long ttl parameter', function () {
          const ttl = MAX_TTL_S * 100;
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                response_type: 'token',
                ttl: ttl,
              }),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.expires_in <= MAX_TTL_S).toBeTruthy();
            });
        });
      });
    });

    describe('?keys_jwe', function () {
      it('should validate the JWE', () => {
        const keys_jwe = 'some_string';
        const code_challenge = 'iyW5ScKr22v_QL-rcW_EGlJrDSOymJvrlXlw4j7JBiQ';

        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: clientId,
              response_type: 'code',
              code_challenge_method: 'S256',
              code_challenge: code_challenge,
              keys_jwe: keys_jwe,
            }),
          })
          .then((res) => {
            expect(res.statusCode).toBe(400);
            expect(res.result.errno).toBe(109);
            expect(res.result.validation.keys[0]).toBe('keys_jwe');
          });
      });

      it('should return the key bundle in PKCE flow', () => {
        const keys_jwe =
          'MjU2R0NNIn0..8L7QykCJ5W-YZtbx.Q_8JFsdWXFNg37PCqZA_JJb4BvqAuh3UMyNE.bSOKJkZspycp9DcGRWtH6g';
        const code_verifier = 'WLjNEANMbRNUSG0uQsUZMQGgIL5FUknGz2jRipY79ZC';
        const code_challenge = 'SWac3rF5sKcyAtsXGMO9feaKqpzgCoA2zowbi20F_0c';
        const secret2 = unique.secret();
        const client2 = {
          name: 'client2Public',
          hashedSecret: encrypt.hash(secret2),
          redirectUri: 'https://example.domain',
          imageUri: 'https://example.foo.domain/logo.png',
          trusted: true,
          publicClient: true,
        };

        return db
          .registerClient(client2)
          .then(() => {
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  client_id: client2.id.toString('hex'),
                  response_type: 'code',
                  code_challenge_method: 'S256',
                  code_challenge: code_challenge,
                  keys_jwe: keys_jwe,
                }),
              })
              .then((res) => {
                expect(res.statusCode).toBe(200);
                return res.result.code;
              });
          })
          .then((code) => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: client2.id.toString('hex'),
                code: code,
                code_verifier: code_verifier,
              },
            });
          })
          .then((res) => {
            expect(res.statusCode).toBe(200);
            expect(res.result.keys_jwe).toBe(keys_jwe);
          });
      });
    });

    describe('response', function () {
      describe('with a trusted client', function () {
        it('should redirect to the redirect_uri', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              const loc = url.parse(res.result.redirect, true);
              const expected = url.parse(client.redirectUri, true);
              expect(loc.protocol).toBe(expected.protocol);
              expect(loc.host).toBe(expected.host);
              expect(loc.pathname).toBe(expected.pathname);
              expect(loc.query.foo).toBe(expected.query.foo);
              expect(loc.query.code).toBeTruthy();
              expect(loc.query.code).toBe(res.result.code);
            });
        });
      });
    });

    describe('check acr payload', () => {
      it('should throw error if mismatch with claims', () => {
        const payload = { acr_values: 'AAL2' };
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams(payload),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.message).toBe('Mismatch acr value');
            expect(res.result.errno).toBe(120);
          });
      });

      it('process request when correct acr_values in claims', () => {
        const payload = { acr_values: 'AAL1' };
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams(payload),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.code).toBeTruthy();
            expect(res.result.redirect).toBeTruthy();
            expect(res.result.state).toBe('1');
          });
      });
    });
  });

  describe('/token', function () {
    it('disallows GET', function () {
      return Server.api.get('/token').then(function (res) {
        expect(res.statusCode).toBe(404);
        assertSecurityHeaders(res);
      });
    });

    describe('?client_id', function () {
      it('is required', function () {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_secret: secret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'client_id');
            assertSecurityHeaders(res);
          });
      });

      it('is forbidden when authz header provided', function () {
        return Server.api
          .post({
            url: '/token',
            headers: {
              authorization: basicAuthHeader(clientId, secret),
            },
            payload: {
              client_id: clientId,
              client_secret: secret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'client_id');
            assertSecurityHeaders(res);
          });
      });

      it('must match an existing client', function () {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_id: '0000000000000000',
              client_secret: secret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            expect(res.result.code).toBe(400);
            expect(res.result.message).toBe('Unknown client');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?client_secret', function () {
      it('is required', function () {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_id: clientId,
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'client_secret');
            assertSecurityHeaders(res);
          });
      });

      it('is forbidden when authz header provided', function () {
        return Server.api
          .post({
            url: '/token',
            headers: {
              authorization: basicAuthHeader(clientId, secret),
            },
            payload: {
              client_secret: secret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            assertInvalidRequestParam(res.result, 'client_secret');
            assertSecurityHeaders(res);
          });
      });

      it('must match server-stored secret', function () {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: badSecret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.message).toBe('Incorrect secret');
          });
      });

      describe('previous secret', function () {
        function getCode(clientId) {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: clientId,
              }),
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              return res.result.code;
            });
        }

        it('should get auth token with secret', function () {
          return getCode(clientId)
            .then(function (code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: code,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.access_token).toBeTruthy();
              expect(res.result.token_type).toBe('bearer');
              expect(res.result.auth_at).toBeTruthy();
              expect(res.result.expires_in).toBeTruthy();
              expect(res.result.scope).toBe('profile');
              expect(res.result.keys_jwe).toBe(undefined);
            });
        });

        it('should get auth token with previous secret', function () {
          return getCode(clientId)
            .then(function (code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secretPrevious,
                  code: code,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.access_token).toBeTruthy();
            });
        });
      });
    });

    describe('authorization header', function () {
      it('should allow fetching get auth token when the secret is valid', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: clientId,
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            return res.result.code;
          })
          .then(function (code) {
            return Server.api.post({
              url: '/token',
              headers: {
                authorization: basicAuthHeader(clientId, secret),
              },
              payload: {
                code: code,
              },
            });
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.access_token).toBeTruthy();
            expect(res.result.token_type).toBe('bearer');
            expect(res.result.auth_at).toBeTruthy();
            expect(res.result.expires_in).toBeTruthy();
            expect(res.result.scope).toBe('profile');
            expect(res.result.keys_jwe).toBe(undefined);
          });
      });

      it('should be rejected if the secret is invalid', function () {
        return Server.api
          .post({
            url: '/token',
            headers: {
              authorization: basicAuthHeader(clientId, badSecret),
            },
            payload: {
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.message).toBe('Incorrect secret');
          });
      });

      it('should be rejected if the credentials are malformed', function () {
        return Server.api
          .post({
            url: '/token',
            headers: {
              authorization:
                'Basic ' + Buffer.from('invalid').toString('base64'),
            },
            payload: {
              code: unique.code().toString('hex'),
            },
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            assertInvalidRequestParam(res.result, 'authorization');
          });
      });
    });

    describe('?grant_type=authorization_code', function () {
      describe('?code', function () {
        it('is required', function () {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
              },
            })
            .then(function (res) {
              assertInvalidRequestParam(res.result, 'code');
              assertSecurityHeaders(res);
            });
        });

        it('must match an existing code', function () {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: unique.code().toString('hex'),
              },
            })
            .then(function (res) {
              expect(res.result.code).toBe(400);
              expect(res.result.message).toBe('Unknown code');
              assertSecurityHeaders(res);
            });
        });

        it('must be a code owned by this client', function () {
          const secret2 = unique.secret();
          const client2 = {
            name: 'client2',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true,
          };
          return db
            .registerClient(client2)
            .then(function () {
              return Server.api
                .post({
                  url: '/authorization',
                  payload: authParams({
                    client_id: client2.id.toString('hex'),
                  }),
                })
                .then(function (res) {
                  expect(res.statusCode).toBe(200);
                  assertSecurityHeaders(res);
                  return res.result.code;
                });
            })
            .then(function (code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  // client is trying to use client2's code
                  client_id: clientId,
                  client_secret: secret,
                  code: code,
                },
              });
            })
            .then(function (res) {
              expect(res.result.code).toBe(400);
              expect(res.result.message).toBe('Incorrect code');
              assertSecurityHeaders(res);
            });
        });

        describe('when used by a public client (PKCE)', function () {
          const code_verifier = 'WFX-9dPwcpPIXt8c5Pbx09_Z61zPm1Fjwv89lVrukOh';
          const code_verifier_bad =
            'QnuuNM5gfnJmWwIjiOKk2SKn8A89tph3-8BjNUUtooJ';
          const code_challenge = 'xWVKKAQVD9XSXT4Z4Oh8dLJ5pqrr0gQes2QwZOVJyAk';
          const secret2 = unique.secret();
          const client2 = {
            name: 'client2Public',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true,
            publicClient: true,
          };

          beforeAll(() => {
            return db.registerClient(client2);
          });

          it('consumes code when provided correct code_verifier', function () {
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  client_id: client2.id.toString('hex'),
                  response_type: 'code',
                  code_challenge_method: 'S256',
                  code_challenge: code_challenge,
                }),
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                assertSecurityHeaders(res);
                return res.result.code;
              })
              .then(function (code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier,
                  },
                });
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                expect(res.result.access_token).toBeTruthy();
                expect(res.result.scope).toBeTruthy();
                expect(res.result.token_type).toBe('bearer');
                expect(res.result.access_token).toBeTruthy();
                expect(res.result.keys_jwe).toBe(undefined);
              });
          });

          it('rejects invalid code_verifier', function () {
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  client_id: client2.id.toString('hex'),
                  response_type: 'code',
                  code_challenge_method: 'S256',
                  code_challenge: code_challenge,
                }),
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                assertSecurityHeaders(res);
                return res.result.code;
              })
              .then(function (code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier_bad,
                  },
                });
              })
              .then(function (res) {
                expect(res.statusCode).toBe(400);
                expect(res.result.errno).toBe(117);
                expect(res.result.message).toBe('Incorrect code_challenge');
              });
          });

          it('must not have expired', function () {
            const exp = config.get('oauthServer.expiration.code');
            config.set('oauthServer.expiration.code', 50);
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  client_id: client2.id.toString('hex'),
                  response_type: 'code',
                  code_challenge_method: 'S256',
                  code_challenge: code_challenge,
                }),
              })
              .then(async function (res) {
                expect(res.statusCode).toBe(200);
                await new Promise((ok) => setTimeout(ok, 60));
                return res.result.code;
              })
              .then(function (code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier,
                  },
                });
              })
              .then(function (res) {
                expect(res.result.code).toBe(400);
                expect(res.result.message).toBe('Expired code');
                assertSecurityHeaders(res);
              })
              .finally(function () {
                config.set('oauthServer.expiration.code', exp);
              });
          });

          it('must be a code owned by this client', function () {
            const client3 = {
              name: 'client3Public',
              hashedSecret: encrypt.hash(secret2),
              redirectUri: 'https://example.domain',
              imageUri: 'https://example.foo.domain/logo.png',
              trusted: true,
              publicClient: true,
            };
            return db
              .registerClient(client3)
              .then(function () {
                return Server.api
                  .post({
                    url: '/authorization',
                    payload: authParams({
                      client_id: client3.id.toString('hex'),
                      response_type: 'code',
                      code_challenge_method: 'S256',
                      code_challenge: code_challenge,
                    }),
                  })
                  .then(function (res) {
                    expect(res.statusCode).toBe(200);
                    assertSecurityHeaders(res);
                    return res.result.code;
                  });
              })
              .then(function (code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    // client2 is trying to use client3's code
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier,
                  },
                });
              })
              .then(function (res) {
                expect(res.result.code).toBe(400);
                expect(res.result.message).toBe('Incorrect code');
                assertSecurityHeaders(res);
              });
          });
        });

        it('must not have expired', function () {
          const exp = config.get('oauthServer.expiration.code');
          config.set('oauthServer.expiration.code', 50);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(async function (res) {
              await new Promise((ok) => setTimeout(ok, 60));
              return res.result.code;
            })
            .then(function (code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: code,
                },
              });
            })
            .then(function (res) {
              expect(res.result.code).toBe(400);
              expect(res.result.message).toBe('Expired code');
              assertSecurityHeaders(res);
            })
            .finally(function () {
              config.set('oauthServer.expiration.code', exp);
            });
        });

        it('cannot use the same code multiple times', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function (res) {
              return res.result.code;
            })
            .then(function (code) {
              return Server.api
                .post({
                  url: '/token',
                  payload: {
                    client_id: clientId,
                    client_secret: secret,
                    code: code,
                  },
                })
                .then(function (res) {
                  expect(res.statusCode).toBe(200);
                  assertSecurityHeaders(res);
                  return Server.api.post({
                    url: '/token',
                    payload: {
                      client_id: clientId,
                      client_secret: secret,
                      code: code,
                    },
                  });
                });
            })
            .then(function (res) {
              expect(res.result.code).toBe(400);
              expect(res.result.message).toBe('Unknown code');
              assertSecurityHeaders(res);
            });
        });

        it('does not accept a `scope` parameter', function () {
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function (res) {
              return res.result.code;
            })
            .then(function (code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: code,
                  scope: 'a',
                },
              });
            })
            .then(function (res) {
              expect(res.result.code).toBe(400);
              expect(res.result.errno).toBe(109);
              expect(res.result.validation).toEqual({
                source: 'payload',
                keys: ['scope'],
              });
              assertSecurityHeaders(res);
            });
        });
      });

      describe('response', function () {
        describe('access_type=online', function () {
          it('should return a correct response', function () {
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  scope: 'email profile profile',
                }),
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                assertSecurityHeaders(res);
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: clientId,
                    client_secret: secret,
                    code: res.result.code,
                    foo: 'bar', // testing stripUnknown
                  },
                });
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                assertSecurityHeaders(res);
                expect(res.result.token_type).toBe('bearer');
                expect(res.result.access_token).toBeTruthy();
                expect(res.result.refresh_token).toBeFalsy();
                expect(res.result.access_token.length).toBe(
                  config.get('oauthServer.unique.token') * 2
                );
                expect(res.result.scope).toBe('email profile');
                expect(res.result.auth_at).toBe(AUTH_AT);
              });
          });
        });

        describe('access_type=offline', function () {
          it('should return a correct response', function () {
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  scope: 'email profile profile',
                  access_type: 'offline',
                }),
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                assertSecurityHeaders(res);
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: clientId,
                    client_secret: secret,
                    code: res.result.code,
                  },
                });
              })
              .then(function (res) {
                expect(res.statusCode).toBe(200);
                assertSecurityHeaders(res);
                expect(res.result.token_type).toBe('bearer');
                expect(res.result.access_token).toBeTruthy();
                expect(res.result.refresh_token).toBeTruthy();
                expect(res.result.access_token.length).toBe(
                  config.get('oauthServer.unique.token') * 2
                );
                expect(res.result.refresh_token.length).toBe(
                  config.get('oauthServer.unique.token') * 2
                );
                expect(res.result.scope).toBe('email profile');
                expect(res.result.auth_at).toBe(AUTH_AT);
              });
          });
        });
      });

      it('with a blank scope', function () {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: '',
            }),
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: res.result.code,
              },
            });
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.token_type).toBe('bearer');
            expect(res.result.access_token).toBeTruthy();
            expect(res.result.access_token.length).toBe(
              config.get('oauthServer.unique.token') * 2
            );
            expect(res.result.scope).toBe('');
          });
      });
    });

    describe('?grant_type=refresh_token', function () {
      describe('?refresh_token', function () {
        it('should be required', function () {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
              },
            })
            .then(function (res) {
              assertInvalidRequestParam(res.result, 'refresh_token');
              assertSecurityHeaders(res);
            });
        });

        it('can refresh a token as a Public (PKCE) Client', function () {
          const clientId = NO_KEY_SCOPES_CLIENT_ID;
          const clientSecret =
            'd914ea58d579ec907a1a40b19fb3f3a631461fe00e494521d41c0496f49d288f';
          let refresh;
          return newToken(
            {
              access_type: 'offline',
              response_type: 'code',
              code_challenge_method: 'S256',
              code_challenge: 'SWac3rF5sKcyAtsXGMO9feaKqpzgCoA2zowbi20F_0c',
            },
            {
              clientId: clientId,
              codeVerifier: 'WLjNEANMbRNUSG0uQsUZMQGgIL5FUknGz2jRipY79ZC',
            }
          )
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              refresh = res.result.refresh_token;
              expect(refresh).toBeTruthy();
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: clientSecret,
                  grant_type: 'refresh_token',
                  refresh_token: refresh,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(400);
              expect(res.result.errno).toBe(109);
              expect(res.result.refresh_token).toBe(undefined);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  grant_type: 'refresh_token',
                  refresh_token: refresh,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              expect(res.result.expires_in).toBeTruthy();
              expect(res.result.access_token).toBeTruthy();
              expect(res.result.refresh_token).toBe(undefined);
            });
        });

        it('should be an existing token', function () {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: unique.token().toString('hex'),
              },
            })
            .then(function (res) {
              expect(res.statusCode).toBe(400);
              assertSecurityHeaders(res);
              expect(res.result.errno).toBe(108);
            });
        });

        it('should be owned by the client_id', function () {
          let id2;
          const secret2 = unique.secret();
          const client2 = {
            name: 'client2',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true,
          };
          return db
            .registerClient(client2)
            .then(function (c) {
              id2 = c.id.toString('hex');
              return newToken({ access_type: 'offline' }); //for main client
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              const refresh = res.result.refresh_token;
              expect(refresh).toBeTruthy();
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: id2, // client2 stole it somehow
                  client_secret: secret2.toString('hex'),
                  grant_type: 'refresh_token',
                  refresh_token: refresh,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(400);
              assertSecurityHeaders(res);
              expect(res.result.errno).toBe(108);
            });
        });

        it('should not create a new refresh token', function () {
          return newToken({ access_type: 'offline' })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.refresh_token).toBe(undefined);
            });
        });
      });

      describe('?scope', function () {
        it('should default to returning the scopes that were originally requested', function () {
          return newToken({
            access_type: 'offline',
            scope: 'email profile',
          })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.scope).toBe('email profile');
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.scope).toBe('email profile');
            });
        });

        it('should be able to reduce scopes', function () {
          return newToken({
            access_type: 'offline',
            scope: 'email profile:write',
          })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.scope).toBe('email profile:write');
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                  scope: 'email',
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.scope).toBe('email');
            });
        });

        describe('expand scopes', () => {
          it('should not expand scopes not in allowedScopes', async function () {
            let res = await newToken({
              access_type: 'offline',
              scope: 'email profile:write',
            });

            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.scope).toBe('email profile:write');
            res = await Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                scope: 'email badscope',
              },
            });

            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(114);
          });

          it('should not expand read scope to write scope', async function () {
            let res = await newToken({
              access_type: 'offline',
              scope: 'email',
            });

            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.scope).toBe('email');
            res = await Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                scope: 'email:write',
              },
            });

            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(114);
          });

          it('should not allow untrusted clients to expand scopes in allowedScopes', async function () {
            const client2 = clientByName('Untrusted');
            let res = await newToken(
              {
                scope: 'profile:email profile:uid',
                access_type: 'offline',
              },
              {
                clientId: client2.id,
              }
            );

            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);

            res = await Server.api.post({
              url: '/token',
              payload: {
                client_id: client2.id,
                grant_type: 'refresh_token',
                client_secret: secret,
                refresh_token: res.result.refresh_token,
                scope: 'foo https://identity.mozilla.com/apps/notes',
              },
            });

            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            expect(res.result.errno).toBe(114);
          });

          it('should allow trusted clients to expand scopes in allowedScopes', async function () {
            let res = await newToken({
              access_type: 'offline',
              scope: 'email profile:write',
            });

            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.scope).toBe('email profile:write');

            res = await Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                scope: 'email https://identity.mozilla.com/apps/notes',
              },
            });

            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.scope).toBe(
              'email https://identity.mozilla.com/apps/notes'
            );
          });
        });
      });

      describe('?ttl', function () {
        it('should reduce the expires_in of the access_token', function () {
          return newToken({ access_type: 'offline' })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                  ttl: 60,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.expires_in <= 60).toBeTruthy();
            });
        });

        it('if greater than the maximum configured value, will return a token with that maximum value', function () {
          return newToken({ access_type: 'offline' })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                  ttl: MAX_TTL_S * 100,
                },
              });
            })
            .then(function (res) {
              expect(res.statusCode).toBe(200);
              assertSecurityHeaders(res);
              expect(res.result.expires_in <= MAX_TTL_S).toBeTruthy();
            });
        });
      });
    });

    describe('?grant_type=fxa-credentials', function () {
      const clientId = '98e6508e88680e1a';

      it('assertion param should be required', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile email',
          },
        });
        assertInvalidRequestParam(res.result, 'assertion');
        assertSecurityHeaders(res);
      });

      it('can directly grant a token with valid assertion', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile email',
            assertion: AN_ASSERTION,
          },
        });
        expect(res.statusCode).toBe(200);
        expect(res.result.expires_in).toBeTruthy();
        expect(res.result.access_token).toBeTruthy();
        expect(res.result.scope).toBe('profile email');
        expect(res.result.refresh_token).toBe(undefined);
      });

      it('can create a refresh token if requested', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile email',
            access_type: 'offline',
            assertion: AN_ASSERTION,
          },
        });
        assertSecurityHeaders(res);
        expect(res.statusCode).toBe(200);
        expect(res.result.expires_in).toBeTruthy();
        expect(res.result.access_token).toBeTruthy();
        expect(res.result.scope).toBe('profile email');
        expect(res.result.refresh_token).toBeTruthy();
      });

      it('accepts configurable ttl', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            ttl: 42,
            assertion: AN_ASSERTION,
            scope: 'profile email',
          },
        });
        assertSecurityHeaders(res);
        expect(res.statusCode).toBe(200);
        expect(res.result.expires_in <= 42).toBeTruthy();
      });

      it('accepts arbitrarily long ttl, but returns the configured maximum ttl', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            ttl: MAX_TTL_S * 100,
            assertion: AN_ASSERTION,
            scope: 'profile email',
          },
        });
        assertSecurityHeaders(res);
        expect(res.result.expires_in <= MAX_TTL_S).toBeTruthy();
        expect(res.statusCode).toBe(200);
      });

      it('rejects invalid assertions', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile testme',
            access_type: 'offline',
            assertion: AN_ASSERTION + 'invalid',
          },
        });
        assertSecurityHeaders(res);
        expect(res.statusCode).toBe(401);
        expect(res.result.message).toBe('Invalid assertion');
      });

      it('rejects clients that are not allowed to grant', async () => {
        const clientId = NO_KEY_SCOPES_CLIENT_ID;
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            assertion: AN_ASSERTION,
            scope: 'profile testme',
          },
        });
        assertSecurityHeaders(res);
        expect(res.statusCode).toBe(400);
        expect(res.result.message).toBe('Invalid grant_type');
      });

      it('rejects disallowed scopes', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: SCOPE_CAN_SCOPE_KEY,
            assertion: AN_ASSERTION,
          },
        });
        assertSecurityHeaders(res);
        expect(res.statusCode).toBe(400);
        expect(res.result.message).toBe('Requested scopes are not allowed');
      });

      describe('strict scope validation', function () {
        const originalConfig = config.get('oauthServer.strictScopeValidation');

        afterEach(function () {
          // Restore original config
          config.set('oauthServer.strictScopeValidation', originalConfig);
        });

        it('should strip invalid scopes when strictScopeValidation is enabled', async () => {
          // Enable strict scope validation
          config.set('oauthServer.strictScopeValidation', true);

          const res = await Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              grant_type: 'fxa-credentials',
              scope: 'profile email invalid:scope another:invalid',
              assertion: AN_ASSERTION,
            },
          });

          assertSecurityHeaders(res);
          expect(res.statusCode).toBe(200);
          expect(res.result.access_token).toBeTruthy();
          // Should only contain valid scopes
          expect(res.result.scope).toBe('profile email');
        });

        it('should keep all scopes when strictScopeValidation is disabled', async () => {
          // Disable strict scope validation
          config.set('oauthServer.strictScopeValidation', false);

          const res = await Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              grant_type: 'fxa-credentials',
              scope: 'profile email invalid:scope another:invalid',
              assertion: AN_ASSERTION,
            },
          });

          assertSecurityHeaders(res);
          expect(res.statusCode).toBe(200);
          expect(res.result.access_token).toBeTruthy();
          // Should contain all requested scopes (including invalid ones)
          expect(res.result.scope).toBe(
            'profile email invalid:scope another:invalid'
          );
        });
      });
    });

    describe('?scope=openid', function () {
      it("should return an id_token with user's sub if PPID not enabled for client", () => {
        return newToken({ scope: 'openid' }).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.access_token).toBeTruthy();
          expect(res.result.id_token).toBeTruthy();
          const jwt = decodeJWT(res.result.id_token);
          const header = jwt.header;
          const claims = jwt.claims;

          expect(header.alg).toBe('RS256');
          expect(header.kid).toBe(config.get('oauthServer.openid.key').kid);

          expect(claims.sub).toBe(USERID);
          expect(claims.aud).toBe(clientId);
          expect(claims.iss).toBe(config.get('oauthServer.openid.issuer'));
          const now = Math.floor(Date.now() / 1000);
          expect(claims.iat <= now).toBeTruthy();
          expect(claims.exp > now).toBeTruthy();
          expect(claims.amr).toEqual(AMR);
          expect(claims.acr).toBe(ACR);
          expect(claims['fxa-aal']).toBe(AAL);

          const at_hash = util.generateTokenHash(res.result.access_token);
          expect(claims.at_hash).toBe(at_hash);
        });
      });

      it('should return an id_token that propagates `resource` and `clientId` in the `aud` claim', () => {
        return newToken(
          { scope: 'openid' },
          { resource: 'https://resource.server1.com' }
        ).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.access_token).toBeTruthy();
          expect(res.result.id_token).toBeTruthy();
          const jwt = decodeJWT(res.result.id_token);
          const claims = jwt.claims;

          expect(claims.aud).toEqual([
            clientId,
            'https://resource.server1.com',
          ]);
        });
      });

      it('should return an id_token with ppid sub if PPID is enabled for client', () => {
        const ppidClient = clientByName('PPID JWT Client');

        return newToken({ scope: 'openid' }, { clientId: ppidClient.id }).then(
          (res) => {
            expect(res.statusCode).toBe(200);
            const { claims } = decodeJWT(res.result.id_token);
            expect(claims.sub).not.toBe(USERID);
            expect(claims.sub).toHaveLength(USERID.length);
          }
        );
      });

      it('should not return an id_token when using the refresh_token grant', async () => {
        const res = await newToken({
          scope: 'profile openid',
          access_type: 'offline',
        });
        expect(res.statusCode).toBe(200);
        expect(res.result.access_token).toBeTruthy();
        expect(res.result.refresh_token).toBeTruthy();
        expect(res.result.id_token).toBeTruthy();

        const res2 = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            client_secret: secret,
            grant_type: 'refresh_token',
            refresh_token: res.result.refresh_token,
            // N.B. no `scope` parameter, so uses the original scopes from above.
          },
        });

        expect(res2.statusCode).toBe(200);
        expect(res2.result.access_token).toBeTruthy();
        expect(res2.result.refresh_token).toBeFalsy();
        expect(res2.result.id_token).toBeFalsy();
        expect(res2.result.scope).toBe('profile');

        const res3 = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            client_secret: secret,
            grant_type: 'refresh_token',
            refresh_token: res.result.refresh_token,
            scope: 'openid',
          },
        });

        expect(res3.statusCode).toBe(200);
        expect(res3.result.access_token).toBeTruthy();
        expect(res3.result.refresh_token).toBeFalsy();
        expect(res3.result.id_token).toBeFalsy();
        expect(res3.result.scope).toBe('');
      });

      it('should omit amr claim when not given in the assertion', async () => {
        const assertion = await genAssertion({
          'fxa-generation': 12345,
          'fxa-verifiedEmail': VEMAIL,
          'fxa-lastAuthAt': AUTH_AT,
          'fxa-tokenVerified': true,
          'fxa-aal': AAL,
          'fxa-profileChangedAt': Date.now(),
        });
        return newToken({ scope: 'openid', assertion }).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.id_token).toBeTruthy();
          const jwt = decodeJWT(res.result.id_token);
          const claims = jwt.claims;

          expect(claims.sub).toBe(USERID);
          expect(claims.aud).toBe(clientId);
          expect(claims.iss).toBe(config.get('oauthServer.openid.issuer'));
          expect(claims.amr).toBe(undefined);
          expect(claims.acr).toBe(ACR);
          expect(claims['fxa-aal']).toBe(AAL);
        });
      });

      it('should omit acr and fxa-aal claims when not given in the assertion', async () => {
        const assertion = await genAssertion({
          'fxa-generation': 12345,
          'fxa-verifiedEmail': VEMAIL,
          'fxa-lastAuthAt': AUTH_AT,
          'fxa-tokenVerified': true,
          'fxa-amr': AMR,
          'fxa-profileChangedAt': Date.now(),
        });
        return newToken({ scope: 'openid', assertion }).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.id_token).toBeTruthy();
          const jwt = decodeJWT(res.result.id_token);
          const claims = jwt.claims;

          expect(claims.sub).toBe(USERID);
          expect(claims.aud).toBe(clientId);
          expect(claims.iss).toBe(config.get('oauthServer.openid.issuer'));
          expect(claims.amr).toEqual(AMR);
          expect(claims.acr).toBe(undefined);
          expect(claims['fxa-aal']).toBe(undefined);
        });
      });

      it('should be available to untrusted reliers', function () {
        const client = clientByName('Untrusted');
        return newToken({ scope: 'openid' }, { client_id: client.id }).then(
          (res) => {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.access_token).toBeTruthy();
            expect(res.result.id_token).toBeTruthy();
          }
        );
      });
    });

    describe('?redirect_uri', () => {
      function getCode(clientId) {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: clientId,
            }),
          })
          .then((res) => {
            return res.result.code;
          });
      }
      it('works with https redirect_uri', () => {
        return getCode(clientId)
          .then((code) => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: code,
                redirect_uri:
                  'https://2aa95473a5115d5f3deb36bb6875cf76f05e4c4d.extensions.allizom.org/',
              },
            });
          })
          .then((res) => {
            expect(res.statusCode).toBe(200);
          });
      });

      it('works with app redirect_uri', () => {
        return getCode(clientId)
          .then((code) => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: code,
                redirect_uri: 'testpilot-notes://redirect.android',
              },
            });
          })
          .then((res) => {
            expect(res.statusCode).toBe(200);
          });
      });

      it('works with query parameters', () => {
        return getCode(clientId)
          .then((code) => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: code,
                redirect_uri: 'https://example.com?extra=params&go=here',
              },
            });
          })
          .then((res) => {
            expect(res.statusCode).toBe(200);
          });
      });

      it('is validated', () => {
        return getCode(clientId)
          .then((code) => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: code,
                redirect_uri: 'https://foo\n\n<>\n\r',
              },
            });
          })
          .then((res) => {
            expect(res.statusCode).toBe(400);
            assertInvalidRequestParam(res.result, 'redirect_uri');
            assertSecurityHeaders(res);
          });
      });
    });
  });

  describe('/client', function () {
    describe('GET /:id', function () {
      describe('response', function () {
        it('should return the correct response', function () {
          return Server.api.get('/client/' + clientId).then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            const body = res.result;
            expect(body.name).toBe(client.name);
            expect(body.image_uri).toBeTruthy();
            expect(body.redirect_uri).toBeTruthy();
            expect(body.trusted).toBeTruthy();
          });
        });

        it('should error for unknown clients', () => {
          return Server.api.get('/client/100200300').then((res) => {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
            const body = res.result;
            expect(body.errno).toBe(109);
            expect(body.message).toBe('Invalid request parameter');
          });
        });
      });

      it('should allow for clients with no redirect_uri', function () {
        return Server.api.get('/client/ea3ca969f8c6bb0d').then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          const body = res.result;
          expect(body.name).toBeTruthy();
          expect(body.image_uri).toBe('');
          expect(body.redirect_uri).toBe('');
        });
      });
    });

    describe('POST /key-data', function () {
      let genericRequest;

      beforeEach(function () {
        genericRequest = {
          url: '/key-data',
          payload: {
            assertion: AN_ASSERTION,
            client_id: SCOPED_CLIENT_ID,
            scope: SCOPE_CAN_SCOPE_KEY,
          },
        };
      });

      it('works with a correct response', () => {
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result).length).toBe(1);

          const body = res.result[SCOPE_CAN_SCOPE_KEY];

          expect(body.identifier).toBe(
            'https://identity.mozilla.com/apps/sample-scope-can-scope-key'
          );
          expect(body.keyRotationSecret).toBe(
            '0000000000000000000000000000000000000000000000000000000000000000'
          );
          expect(body.keyRotationTimestamp).toBe(123456);
        });
      });

      it('works with multiple scopes', () => {
        const ANOTHER_CAN_SCOPE_KEY =
          'https://identity.mozilla.com/apps/another-can-scope-key';
        genericRequest.payload.scope = `${SCOPE_CAN_SCOPE_KEY} ${ANOTHER_CAN_SCOPE_KEY}`;

        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result).length).toBe(2);

          const keyOne = res.result[SCOPE_CAN_SCOPE_KEY];
          const keyTwo = res.result[ANOTHER_CAN_SCOPE_KEY];

          expect(keyOne.identifier).toBe(SCOPE_CAN_SCOPE_KEY);
          expect(keyOne.keyRotationSecret).toBe(
            '0000000000000000000000000000000000000000000000000000000000000000'
          );
          expect(keyOne.keyRotationTimestamp).toBe(123456);

          expect(keyTwo.identifier).toBe(ANOTHER_CAN_SCOPE_KEY);
          expect(keyTwo.keyRotationSecret).toBe(
            '0000000000000000000000000000000000000000000000000000000000000000'
          );
          expect(keyTwo.keyRotationTimestamp).toBe(123456);
        });
      });

      it('fails with non-existent client_id', () => {
        genericRequest.payload.client_id = BAD_CLIENT_ID;
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(400);
          assertSecurityHeaders(res);
          const body = res.result;
          expect(body.errno).toBe(101);
          expect(body.message).toBe('Unknown client');
        });
      });

      it('succeeds with a non-scoped-key scope', () => {
        genericRequest.payload.scope =
          'https://identity.mozilla.com/apps/sample-scope';
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result).length).toBe(0);
        });
      });

      it('succeeds with scopes that arent explicitly defined in config', () => {
        genericRequest.payload.scope += ' kv';
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result)).toEqual([SCOPE_CAN_SCOPE_KEY]);
        });
      });

      it('fails with bad assertion', () => {
        genericRequest.payload.assertion = AN_ASSERTION + 'invalid';
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(401);
          assertSecurityHeaders(res);
          const body = res.result;
          expect(body.message).toBe('Invalid assertion');
        });
      });

      it('fails for clients that are not allowed the requested scope', () => {
        genericRequest.payload.client_id = NO_KEY_SCOPES_CLIENT_ID;

        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(400);
          expect(res.result.message).toBe('Requested scopes are not allowed');
          assertSecurityHeaders(res);
        });
      });

      it('fails for clients that have no allowedScopes', () => {
        genericRequest.payload.client_id = NO_ALLOWED_SCOPES_CLIENT_ID;

        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(400);
          expect(res.result.message).toBe('Requested scopes are not allowed');
          assertSecurityHeaders(res);
        });
      });

      it('correctly handles authAt timestamp for newly-created accounts', async () => {
        genericRequest.payload.assertion = await genAssertion({
          'fxa-generation': 1549910733629,
          'fxa-verifiedEmail': VEMAIL,
          'fxa-lastAuthAt': 1549910733,
          'fxa-tokenVerified': true,
          'fxa-amr': AMR,
          'fxa-aal': AAL,
          'fxa-profileChangedAt': Date.now(),
        });
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result).length).toBe(1);
        });
      });

      it('uses fxa-keysChangedAt for the key rotation timestamp', async () => {
        genericRequest.payload.assertion = await genAssertion({
          'fxa-generation': 1549910740000,
          'fxa-verifiedEmail': VEMAIL,
          'fxa-lastAuthAt': 1549910733,
          'fxa-tokenVerified': true,
          'fxa-amr': AMR,
          'fxa-aal': AAL,
          'fxa-profileChangedAt': Date.now(),
          'fxa-keysChangedAt': 1549910340000,
        });
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result).length).toBe(1);
          const keyOne = res.result[SCOPE_CAN_SCOPE_KEY];
          expect(keyOne.keyRotationTimestamp).toBe(1549910340000);
        });
      });

      it('falls back to fxa-generation when fxa-keysChangedAt is falsy', async () => {
        genericRequest.payload.assertion = await genAssertion({
          'fxa-generation': 1549910730000,
          'fxa-verifiedEmail': VEMAIL,
          'fxa-lastAuthAt': 1549910733,
          'fxa-tokenVerified': true,
          'fxa-amr': AMR,
          'fxa-aal': AAL,
          'fxa-profileChangedAt': Date.now(),
          'fxa-keysChangedAt': undefined,
        });
        return Server.api.post(genericRequest).then((res) => {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(Object.keys(res.result).length).toBe(1);
          const keyOne = res.result[SCOPE_CAN_SCOPE_KEY];
          expect(keyOne.keyRotationTimestamp).toBe(1549910730000);
        });
      });
    });
  });

  describe('/verify', function () {
    describe('unknown token', function () {
      it('should not error', function () {
        return Server.api
          .post({
            url: '/verify',
            payload: {
              token: unique.token().toString('hex'),
            },
          })
          .then(function (res) {
            expect(res.statusCode).toBe(400);
            assertSecurityHeaders(res);
          });
      });
    });

    it('should reject expired tokens from after the epoch', async function () {
      let res = await newToken({
        ttl: 1,
      });

      expect(res.statusCode).toBe(200);
      assertSecurityHeaders(res);
      expect(res.result.expires_in).toBe(1);

      sandbox.useFakeTimers({
        now: Date.now() + 1000 * 60 * 60, // 1 hr in future
        shouldAdvanceTime: true,
      });

      res = await Server.api.post({
        url: '/verify',
        payload: {
          token: res.result.access_token,
        },
      });

      expect(res.statusCode).toBe(400);
      assertSecurityHeaders(res);
      expect(res.result.errno).toBe(115);
    });

    describe('response', function () {
      it('should return the correct response', function () {
        return newToken({ scope: 'profile' })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            return Server.api.post({
              url: '/verify',
              payload: {
                token: res.result.access_token,
              },
            });
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.user).toBe(USERID);
            expect(res.result.client_id).toBe(clientId);
            expect(res.result.scope[0]).toBe('profile');
            expect(res.result.email).toBe(undefined);
            expect(res.result.profile_changed_at).toBe(undefined);
          });
      });

      it('should return profile_changed_at when set', async function () {
        const assertion = await genAssertion({
          'fxa-generation': 1549910730000,
          'fxa-verifiedEmail': VEMAIL,
          'fxa-lastAuthAt': 1549910733,
          'fxa-tokenVerified': true,
          'fxa-amr': AMR,
          'fxa-aal': AAL,
          'fxa-profileChangedAt': PROFILE_CHANGED_AT_LATER_TIME,
        });
        return newToken({ scope: 'profile', assertion })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            return Server.api.post({
              url: '/verify',
              payload: {
                token: res.result.access_token,
              },
            });
          })
          .then(function (res) {
            expect(res.statusCode).toBe(200);
            assertSecurityHeaders(res);
            expect(res.result.user).toBe(USERID);
            expect(res.result.client_id).toBe(clientId);
            expect(res.result.scope[0]).toBe('profile');
            expect(res.result.email).toBe(undefined);
            expect(res.result.profile_changed_at).toBe(
              PROFILE_CHANGED_AT_LATER_TIME
            );
          });
      });
    });

    it('should not return the email by default for profile:email scope', function () {
      return newToken({ scope: 'profile:email' })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.email).toBe(undefined);
        });
    });

    it('should not return email for payload having email:false', function () {
      return newToken({ scope: 'profile:email' })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
              email: false,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.email).toBe(undefined);
        });
    });

    it('should not return email for payload having email:true', function () {
      return newToken({ scope: 'profile:email' })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
              email: true,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result.email).toBe(undefined);
        });
    });
  });

  describe('/destroy', function () {
    it('should destroy access tokens', function () {
      let token;
      return newToken()
        .then(function (res) {
          token = res.result.access_token;
          return Server.api.post({
            url: '/destroy',
            payload: {
              token: token,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result).toEqual({});
          return db.getAccessToken(encrypt.hash(token)).then(function (tok) {
            expect(tok).toBe(undefined);
          });
        });
    });

    it('should destroy refresh tokens', function () {
      let token;
      return newToken({ access_type: 'offline' })
        .then(function (res) {
          token = res.result.refresh_token;
          return Server.api.post({
            url: '/destroy',
            payload: {
              refresh_token: token,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result).toEqual({});
          return db.getRefreshToken(encrypt.hash(token)).then(function (tok) {
            expect(tok).toBe(undefined);
          });
        });
    });

    it('should destroy refresh tokens by id', function () {
      let token;
      return newToken({ access_type: 'offline' })
        .then(function (res) {
          token = res.result.refresh_token;
          const refreshTokenId = encrypt.hash(token).toString('hex');
          return Server.api.post({
            url: '/destroy',
            payload: {
              refresh_token_id: refreshTokenId,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
          expect(res.result).toEqual({});
          return db.getRefreshToken(encrypt.hash(token)).then(function (tok) {
            expect(tok).toBe(undefined);
          });
        });
    });

    it('should accept and ignore client_secret without client_id, for historical reasons', function () {
      // Historical reasons ref https://github.com/mozilla/fxa-oauth-server/pull/198
      return newToken()
        .then(function (res) {
          return Server.api.post({
            url: '/destroy',
            payload: {
              token: res.result.access_token,
              client_secret: badSecret,
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
        });
    });

    it('should accept empty client_secret without client_id, for historical reasons', function () {
      // Historical reasons ref https://github.com/mozilla/fxa-oauth-server/pull/198
      return newToken()
        .then(function (res) {
          return Server.api.post({
            url: '/destroy',
            payload: {
              token: res.result.access_token,
              client_secret: '',
            },
          });
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res);
        });
    });

    it('should fail if invalid client credentials are provided in authorization header', async () => {
      const tok = (await newToken()).result;
      const res = await Server.api.post({
        url: '/destroy',
        headers: {
          authorization: basicAuthHeader(clientId, badSecret),
        },
        payload: {
          token: tok.access_token,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.result.errno).toBe(102);
    });

    it('should succeed if valid client credentials are provided in authorization header', async () => {
      const tok = (await newToken()).result;
      const res = await Server.api.post({
        url: '/destroy',
        headers: {
          authorization: basicAuthHeader(clientId, secret),
        },
        payload: {
          token: tok.access_token,
        },
      });
      expect(res.statusCode).toBe(200);
    });

    it('should fail if invalid client credentials are provided in request body', async () => {
      const tok = (await newToken()).result;
      const res = await Server.api.post({
        url: '/destroy',
        payload: {
          client_id: clientId,
          client_secret: badSecret,
          token: tok.access_token,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.result.errno).toBe(102);
    });

    it('should succeed if valid client credentials are provided in request body', async () => {
      const tok = (await newToken()).result;
      const res = await Server.api.post({
        url: '/destroy',
        payload: {
          client_id: clientId,
          client_secret: secret,
          token: tok.access_token,
        },
      });
      expect(res.statusCode).toBe(200);
    });

    it('should fail if client credentials are provided in both body and header', async () => {
      const tok = (await newToken()).result;
      const res = await Server.api.post({
        url: '/destroy',
        headers: {
          authorization: basicAuthHeader(clientId, secret),
        },
        payload: {
          client_id: clientId,
          client_secret: secret,
          token: tok.access_token,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.result.errno).toBe(109);
    });

    it('should fail if client_id is not the owner of the token', async () => {
      const tok = (await newToken()).result;
      const res = await Server.api.post({
        url: '/destroy',
        payload: {
          client_id: NO_ALLOWED_SCOPES_CLIENT_ID, // this is a public client, so no `client_secret`
          token: tok.access_token,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.result.errno).toBe(108);
    });
  });

  describe('/jwks', function () {
    it('should not include the private part of the key', function () {
      return Server.api
        .get({
          url: '/jwks',
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res, {
            'cache-control': 'max-age=10, must-revalidate, public',
          });

          const key = res.result.keys[0];
          expect(key.n).toBeTruthy();
          expect(key.e).toBeTruthy();
          expect(key.d).toBeFalsy();
        });
    });

    // Skipped: requires config/oldKey.json which is not generated by default
    it.skip('should include the oldKey if present', function () {
      expect(config.get('oauthServer.openid.oldKey')).toBeTruthy();
      return Server.api
        .get({
          url: '/jwks',
        })
        .then(function (res) {
          expect(res.statusCode).toBe(200);
          assertSecurityHeaders(res, {
            'cache-control': 'max-age=10, must-revalidate, public',
          });

          const keys = res.result.keys;
          expect(keys.length).toBe(2);
          expect(keys[1].d).toBeFalsy();
          expect(keys[0].kid).not.toBe(keys[1].kid);
        });
    });
  });

  describe('/authorized-clients', () => {
    let user1, user2, client1Id, client2Id, client1, client2;

    async function withMockAssertion(user, params) {
      const assertion = await genAssertion(
        {
          'fxa-generation': 123456,
          'fxa-verifiedEmail': user.email || VEMAIL,
          'fxa-lastAuthAt': AUTH_AT,
          'fxa-tokenVerified': true,
          'fxa-amr': AMR,
          'fxa-aal': AAL,
        },
        user.uid
      );
      return {
        assertion,
        ...params,
      };
    }

    async function makeAccessToken(client, user, scope) {
      const token = await db.generateAccessToken({
        clientId: client.id,
        name: client.name,
        canGrant: client.canGrant,
        userId: buf(user.uid),
        email: user.email,
        scope: ScopeSet.fromArray(scope),
      });
      return token.tokenId.toString('hex');
    }

    async function makeRefreshToken(client, user, scope) {
      const token = await db.generateRefreshToken({
        clientId: client.id,
        userId: buf(user.uid),
        email: user.email,
        scope: ScopeSet.fromArray(scope),
      });
      return token.tokenId.toString('hex');
    }

    beforeEach(async () => {
      user1 = {
        uid: unique(16).toString('hex'),
        email: unique(10).toString('hex') + '@example.com',
      };

      user2 = {
        uid: unique(16).toString('hex'),
        email: unique(10).toString('hex') + '@example.com',
      };

      client1Id = unique.id();
      client1 = {
        name: 'test/api/authorized-clients/bbb-one',
        id: client1Id,
        hashedSecret: encrypt.hash(unique.secret()),
        redirectUri: 'https://example.domain',
        imageUri: 'https://example.com/logo.png',
        trusted: true,
      };
      await db.registerClient(client1);

      client2Id = unique.id();
      client2 = {
        name: 'test/api/authorized-clients/aaa-two',
        id: client2Id,
        hashedSecret: encrypt.hash(unique.secret()),
        redirectUri: 'https://example.domain',
        imageUri: 'https://example.com/logo.png',
        trusted: false,
      };
      await db.registerClient(client2);
    });

    describe('POST /authorized-clients', () => {
      it('should list authorized clients in a specific order', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user1, ['bb_scope', 'aa_scope']);
        const res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const clients = res.result;
        expect(clients.length).toBe(2);
        // The API sorts the results by last-used time and then by name.
        // Since we create the token for client2 after that of client1,
        // either way we'll end up with client2 at the start of the list.
        expect(clients[0].client_id).toBe(client2Id.toString('hex'));
        expect(clients[0].created_time).toBeTruthy();
        expect(clients[0].last_access_time).toBeTruthy();
        expect(clients[0].client_name).toBe(
          'test/api/authorized-clients/aaa-two'
        );
        expect(clients[0].scope).toEqual(['aa_scope', 'bb_scope']);

        expect(clients[1].client_id).toBe(client1Id.toString('hex'));
        expect(clients[1].created_time).toBeTruthy();
        expect(clients[1].last_access_time).toBeTruthy();
        expect(clients[1].client_name).toBe(
          'test/api/authorized-clients/bbb-one'
        );
        expect(clients[1].scope).toEqual(['profile']);
      });

      it('should not list tokens of different users', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user2, ['bb_scope', 'aa_scope']);

        const res1 = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res1.statusCode).toBe(200);
        assertSecurityHeaders(res1);
        const clients1 = res1.result;
        expect(clients1.length).toBe(1);
        expect(clients1[0].client_id).toBe(client1Id.toString('hex'));

        const res2 = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user2, {}),
        });
        expect(res2.statusCode).toBe(200);
        assertSecurityHeaders(res2);
        const clients2 = res2.result;
        expect(clients2.length).toBe(1);
        expect(clients2[0].client_id).toBe(client2Id.toString('hex'));
      });

      it('should separately list different refresh tokens from the same client', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client1, user1, ['other', 'scope']);
        await makeRefreshToken(client2, user1, ['profile']);
        await makeRefreshToken(client2, user1, [
          'aaaSortMeFirst',
          'other',
          'scope',
        ]);
        await makeAccessToken(client2, user1, ['profile']);
        const res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const clients = res.result;
        expect(clients.length).toBe(3);
        expect(clients[0].client_id).toBe(client2Id.toString('hex'));
        expect(clients[0].scope).toEqual(['aaaSortMeFirst', 'other', 'scope']);
        expect(clients[0].refresh_token_id).toBeTruthy();
        expect(clients[1].client_id).toBe(client2Id.toString('hex'));
        expect(clients[1].scope).toEqual(['profile']);
        expect(clients[1].refresh_token_id).toBeTruthy();
        expect(clients[2].client_id).toBe(client1Id.toString('hex'));
        expect(clients[2].scope).toEqual(['other', 'profile', 'scope']);
        expect(clients[2].refresh_token_id).toBeFalsy();
      });

      it('should not list canGrant=1 clients that only have access tokens', async () => {
        client2.canGrant = true;
        await db.updateClient(client2);
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user1, ['profile']);
        const res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const clients = res.result;
        expect(clients.length).toBe(1);
        expect(clients[0].client_id).toBe(client1Id.toString('hex'));
      });

      it('should list canGrant=1 clients that have refresh tokens', async () => {
        await db.updateClient({
          ...client2,
          canGrant: true,
        });
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        const res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const clients = res.result;
        expect(clients.length).toBe(2);
        expect(clients[0].client_id).toBe(client2Id.toString('hex'));
        expect(clients[1].client_id).toBe(client1Id.toString('hex'));
      });

      it('requires a valid assertion', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        let res = await Server.api.post({
          url: '/authorized-clients',
          payload: {
            assertion: AN_ASSERTION + 'invalid',
          },
        });
        expect(res.statusCode).toBe(401);
        expect(res.result.message).toBe('Invalid assertion');
        assertSecurityHeaders(res);

        // Check that it didn't delete the token.
        res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);
        const clients = res.result;
        expect(clients.length).toBe(1);
        expect(clients[0].client_id).toBe(client1Id.toString('hex'));
      });
    });

    describe('POST /authorized-clients/destroy', function () {
      it('can delete all tokens a target client id', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);

        let res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: await withMockAssertion(user1, {
            client_id: client1Id.toString('hex'),
          }),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);

        res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        expect(res.result.length).toBe(2);
        expect(res.result[0].client_id).toBe(client2Id.toString('hex'));

        res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: await withMockAssertion(user1, {
            client_id: client2Id.toString('hex'),
          }),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);

        res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        expect(res.result.length).toBe(0);
      });

      it('deletes outstanding authorization codes for the client', async () => {
        const result = await withMockAssertion(user1, {});
        let res = await Server.api.post({
          url: '/authorization',
          payload: authParams({
            assertion: result.assertion,
            scope: 'profile',
          }),
        });
        const code = res.result.code;
        expect(code).toBeTruthy();
        await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: await withMockAssertion(user1, {
            client_id: clientId,
          }),
        });
        expect(res.statusCode).toBe(200);
        res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            client_secret: secret,
            code,
          },
        });
        expect(res.statusCode).toBe(400);
        expect(res.result.code).toBe(400);
        expect(res.result.errno).toBe(105);
        expect(res.result.message).toBe('Unknown code');
        assertSecurityHeaders(res);
      });

      it('can delete a specific token of a target client id', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        const tokenId = await makeRefreshToken(client2, user1, [
          'other',
          'scope',
        ]);

        let res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: await withMockAssertion(user1, {
            client_id: client2Id.toString('hex'),
            refresh_token_id: tokenId,
          }),
        });
        expect(res.statusCode).toBe(200);
        assertSecurityHeaders(res);

        res = await Server.api.post({
          url: '/authorized-clients',
          payload: await withMockAssertion(user1, {}),
        });
        expect(res.statusCode).toBe(200);
        expect(res.result.length).toBe(2);
        expect(res.result[0].client_id).toBe(client2Id.toString('hex'));
        expect(res.result[0].scope).toEqual(['profile']);
        expect(res.result[0].refresh_token_id).not.toBe(tokenId);
        expect(res.result[1].client_id).toBe(client1Id.toString('hex'));
        expect(res.result[1].scope).toEqual(['profile']);
      });

      it('refuses to delete token for wrong client_id', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        const tokenId = await makeRefreshToken(client2, user1, [
          'other',
          'scope',
        ]);
        const res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: await withMockAssertion(user1, {
            client_id: client1Id.toString('hex'),
            refresh_token_id: tokenId,
          }),
        });
        expect(res.statusCode).toBe(400);
        expect(res.result.errno).toBe(122);
        expect(res.result.message).toBe('Unknown token');
        assertSecurityHeaders(res);
      });

      it('refuses to delete token for wrong user', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        const tokenId = await makeRefreshToken(client2, user1, [
          'other',
          'scope',
        ]);
        const res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: await withMockAssertion(user2, {
            client_id: client2Id.toString('hex'),
            refresh_token_id: tokenId,
          }),
        });
        expect(res.statusCode).toBe(400);
        expect(res.result.errno).toBe(122);
        expect(res.result.message).toBe('Unknown token');
        assertSecurityHeaders(res);
      });

      it('requires a valid assertion', async () => {
        const res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: {
            assertion: AN_ASSERTION + 'invalid',
            client_id: client1Id.toString('hex'),
          },
        });
        expect(res.statusCode).toBe(401);
        expect(res.result.message).toBe('Invalid assertion');
        assertSecurityHeaders(res);
      });
    });
  });

  describe('/introspect', () => {
    let accessToken;

    beforeAll(async () => {
      const res = await newToken({
        access_type: 'online',
      });
      accessToken = res.result.access_token;
    });

    it('should return { active: false } if token is not found', async () => {
      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: 'not a known token',
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.active).toBe(false);
    });

    it('should succeed if token is an access token', async () => {
      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: accessToken,
        },
      });
      expect(res.statusCode).toBe(200);
      const { result } = res;
      expect(result.active).toBe(true);
      expect(result.scope).toBe('profile');
      expect(result.client_id).toBe('dcdb5ae7add825d2');
      expect(result.token_type).toBe('access_token');
      expect(typeof result.exp).toBe('number');
      expect(result.exp).toBeGreaterThan(Date.now());
      expect(typeof result.iat).toBe('number');
      expect(result.iat).toBeLessThan(Date.now());
      expect(result.sub).toBe(USERID);
      expect(result['fxa-lastUsedAt']).toBeUndefined();
    });

    it('should return { active: false } if token is an access token, but token_type_hint=refresh_token', async () => {
      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: accessToken,
          token_type_hint: 'refresh_token',
        },
      });
      expect(res.statusCode).toBe(200);
      expect(res.result.active).toBe(false);
    });

    it('should return a `not a public client` error if not a public client and using a refresh token', async () => {
      const tokenRes = await newToken({
        access_type: 'offline',
      });
      expect(tokenRes.statusCode).toBe(200);
      expect(tokenRes.result.refresh_token).toBeTruthy();

      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenRes.result.refresh_token,
        },
      });
      expect(res.statusCode).toBe(400);
      expect(res.result.errno).toBe(116);
    });

    it('should succeed if token is a refresh token', async () => {
      const clientId = '38a6b9b3a65a1872';
      const tokenRes = await newToken(
        {
          access_type: 'offline',
          response_type: 'code',
          code_challenge_method: 'S256',
          code_challenge: 'SWac3rF5sKcyAtsXGMO9feaKqpzgCoA2zowbi20F_0c',
        },
        {
          clientId: clientId,
          codeVerifier: 'WLjNEANMbRNUSG0uQsUZMQGgIL5FUknGz2jRipY79ZC',
        }
      );
      expect(tokenRes.statusCode).toBe(200);
      expect(tokenRes.result.refresh_token).toBeTruthy();

      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenRes.result.refresh_token,
        },
      });

      expect(res.statusCode).toBe(200);
      const { result } = res;

      expect(result.active).toBe(true);
      expect(result.scope).toBe('profile');
      expect(result.client_id).toBe('38a6b9b3a65a1872');
      expect(result.token_type).toBe('refresh_token');
      expect(result.exp).toBeUndefined();
      expect(typeof result.iat).toBe('number');
      expect(result.iat).toBeLessThan(Date.now());
      expect(result.sub).toBe(USERID);
      expect(typeof result['fxa-lastUsedAt']).toBe('number');
      expect(result['fxa-lastUsedAt']).toBeLessThan(Date.now());
    });

    it('should return { active: false } if token is an refresh token, but token_type_hint=access_token', async () => {
      const clientId = '38a6b9b3a65a1872';
      const tokenRes = await newToken(
        {
          access_type: 'offline',
          response_type: 'code',
          code_challenge_method: 'S256',
          code_challenge: 'SWac3rF5sKcyAtsXGMO9feaKqpzgCoA2zowbi20F_0c',
        },
        {
          clientId: clientId,
          codeVerifier: 'WLjNEANMbRNUSG0uQsUZMQGgIL5FUknGz2jRipY79ZC',
        }
      );
      expect(tokenRes.statusCode).toBe(200);
      expect(tokenRes.result.refresh_token).toBeTruthy();

      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenRes.result.refresh_token,
          token_type_hint: 'access_token',
        },
      });

      expect(res.statusCode).toBe(200);
      const { result } = res;

      expect(result.active).toBe(false);
    });
  });

  describe('JWT access token', () => {
    it('succeeds', async () => {
      const jwtClient = clientByName('JWT Client');
      expect(jwtClient.canGrant).toBeTruthy(); //sanity check
      const clientId = jwtClient.id;

      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: clientId,
          resource: 'https://resource.server.com/?query=1',
        }
      );

      expect(tokenResult.statusCode).toBe(200);
      assertSecurityHeaders(tokenResult);
      expect(tokenResult.result.access_token).toBeTruthy();
      expect(
        validators.jwt.validate(tokenResult.result.access_token).error
      ).toBeUndefined();
      expect(tokenResult.result.token_type).toBe('bearer');
      expect(tokenResult.result.auth_at).toBeTruthy();
      expect(tokenResult.result.expires_in).toBeTruthy();
      expect(tokenResult.result.scope).toBe('profile');
      expect(tokenResult.result.keys_jwe).toBeUndefined();
      expect(tokenResult.result.refresh_token).toBeTruthy();

      const tokenResultJWT = decodeJWT(tokenResult.result.access_token);
      expect(tokenResultJWT.claims.aud).toEqual([
        clientId,
        'https://resource.server.com/?query=1',
      ]);
      expect(tokenResultJWT.claims.client_id).toBe(clientId);
      expect(tokenResultJWT.claims.exp).toBeTruthy();
      expect(tokenResultJWT.claims.iat).toBeTruthy();
      expect(tokenResultJWT.claims.jti).toBeTruthy();
      expect(tokenResultJWT.claims.scope).toBe('profile');
      expect(tokenResultJWT.claims.sub).toBe(USERID);

      const verifyResult = await Server.api.post({
        url: '/verify',
        payload: {
          token: tokenResult.result.access_token,
        },
      });

      expect(verifyResult.statusCode).toBe(200);

      const introspectResult = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenResult.result.access_token,
          token_type_hint: 'access_token',
        },
      });

      expect(introspectResult.statusCode).toBe(200);
      expect(introspectResult.result.active).toBe(true);

      const destroyResult = await Server.api.post({
        url: '/destroy',
        payload: {
          token: tokenResult.result.access_token,
        },
      });

      expect(destroyResult.statusCode).toBe(200);

      const verifyInvalidTokenResult = await Server.api.post({
        url: '/verify',
        payload: {
          token: tokenResult.result.access_token,
        },
      });

      expect(verifyInvalidTokenResult.statusCode).toBe(400);
      expect(verifyInvalidTokenResult.result.errno).toBe(108);

      const introspectInvalidTokenResult = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenResult.result.access_token,
          token_type_hint: 'access_token',
        },
      });

      expect(introspectInvalidTokenResult.statusCode).toBe(200);
      expect(introspectInvalidTokenResult.result.active).toBe(false);

      const refreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: clientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: tokenResult.result.refresh_token,
          resource: 'https://resource.server2.com',
          scope: 'profile',
        },
      });

      expect(refreshTokenResult.statusCode).toBe(200);
      assertSecurityHeaders(refreshTokenResult);
      expect(refreshTokenResult.result.access_token).toBeTruthy();
      expect(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      ).toBeUndefined();
      expect(refreshTokenResult.result.token_type).toBe('bearer');
      expect(refreshTokenResult.result.expires_in).toBeTruthy();
      expect(refreshTokenResult.result.scope).toBe('profile');
      expect(refreshTokenResult.result.keys_jwe).toBeUndefined();
      expect(refreshTokenResult.result.refresh_token).toBeUndefined();

      const refreshTokenResultJWT = decodeJWT(
        refreshTokenResult.result.access_token
      );
      expect(refreshTokenResultJWT.claims.aud).toEqual([
        clientId,
        'https://resource.server2.com',
      ]);
      expect(refreshTokenResultJWT.claims.client_id).toBe(clientId);
      expect(refreshTokenResultJWT.claims.exp).toBeTruthy();
      expect(refreshTokenResultJWT.claims.iat).toBeTruthy();
      expect(refreshTokenResultJWT.claims.jti).toBeTruthy();
      expect(refreshTokenResultJWT.claims.scope).toBe('profile');
      // No ppid or rotation.
      expect(refreshTokenResultJWT.claims.sub).toBe(USERID);

      const noResourceRefreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: clientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: tokenResult.result.refresh_token,
          scope: 'profile',
        },
      });
      expect(noResourceRefreshTokenResult.statusCode).toBe(200);
      const noResourceRefreshTokenResultJWT = decodeJWT(
        noResourceRefreshTokenResult.result.access_token
      );
      // If only the client_id is returned, return a string rather than an array.
      expect(noResourceRefreshTokenResultJWT.claims.aud).toBe(clientId);
    });
  });

  describe('PPIDs', () => {
    let noPpidClient;
    let noPpidClientId;

    let ppidClient;
    let ppidClientId;

    beforeEach(() => {
      noPpidClient = clientByName('JWT Client');
      noPpidClientId = noPpidClient.id;

      ppidClient = clientByName('PPID JWT Client');
      ppidClientId = ppidClient.id;
    });

    it('returns a different sub to the user ID', async () => {
      const ppidTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: ppidClientId,
        }
      );

      expect(ppidTokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(ppidTokenResult.result.access_token).error
      ).toBeUndefined();

      const ppidJWT = decodeJWT(ppidTokenResult.result.access_token);
      expect(ppidJWT.claims.sub).not.toBe(USERID);
      expect(ppidJWT.claims.sub).toHaveLength(USERID.length);
    });

    it('does not automatically rotate unless enabled for client', async () => {
      const initialTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: ppidClientId,
        }
      );
      expect(initialTokenResult.statusCode).toBe(200);
      const initialJWT = decodeJWT(initialTokenResult.result.access_token);
      expect(initialJWT.claims.sub).not.toBe(USERID);
      expect(initialJWT.claims.sub).toHaveLength(USERID.length);

      // delay long enough to force a rotation if enabled for client
      await new Promise((ok) => setTimeout(ok, 200));

      const refreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: ppidClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: initialTokenResult.result.refresh_token,
        },
      });

      expect(refreshTokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      ).toBeUndefined();

      const refreshTokenJWT = decodeJWT(refreshTokenResult.result.access_token);

      expect(initialJWT.claims.sub).toBe(refreshTokenJWT.claims.sub);
    });

    it('ignores ppid_seed unless PPID is enabled for client', async () => {
      const seededTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: noPpidClientId,
          ppidSeed: 100,
        }
      );
      expect(seededTokenResult.statusCode).toBe(200);
      const seededJWT = decodeJWT(seededTokenResult.result.access_token);
      expect(seededTokenResult.result.refresh_token).toBeTruthy();

      expect(seededJWT.claims.sub).toBe(USERID);

      // delay long enough to force a rotation if enabled for client
      await new Promise((ok) => setTimeout(ok, 200));

      const refreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: noPpidClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          ppid_seed: 101,
          refresh_token: seededTokenResult.result.refresh_token,
        },
      });

      expect(refreshTokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      ).toBeUndefined();

      const refreshTokenJWT = decodeJWT(refreshTokenResult.result.access_token);

      expect(refreshTokenJWT.claims.sub).toBe(USERID);
    });
  });

  describe('Rotating PPIDs', () => {
    let rotatingSubClient;
    let rotatingSubClientId;

    beforeEach(() => {
      rotatingSubClient = clientByName('Rotating PPID JWT Client');
      rotatingSubClientId = rotatingSubClient.id;
    });

    it('automatically rotates based on server time', async () => {
      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
        }
      );
      expect(tokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(tokenResult.result.access_token).error
      ).toBeUndefined();
      const tokenJWT = decodeJWT(tokenResult.result.access_token);
      expect(tokenJWT.claims.sub).not.toBe(USERID);
      expect(tokenJWT.claims.sub).toHaveLength(USERID.length);

      // delay long enough to force a server side rotation if enabled for client
      await new Promise((ok) => setTimeout(ok, 200));

      const serverRotatedResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: rotatingSubClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: tokenResult.result.refresh_token,
        },
      });

      expect(serverRotatedResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(serverRotatedResult.result.access_token).error
      ).toBeUndefined();

      const serverRotatedJWT = decodeJWT(
        serverRotatedResult.result.access_token
      );
      expect(serverRotatedJWT.claims.sub).not.toBe(tokenJWT.claims.sub);
      expect(serverRotatedJWT.claims.sub).not.toBe(USERID);
      expect(serverRotatedJWT.claims.sub).toHaveLength(USERID.length);
    });

    it('accepts ppid_seed when fetching tokens', async () => {
      const accessTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
          ppidSeed: 100,
        }
      );
      expect(accessTokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(accessTokenResult.result.access_token).error
      ).toBeUndefined();
      const accessTokenJWT = decodeJWT(accessTokenResult.result.access_token);
      expect(accessTokenJWT.claims.sub).toBeTruthy();

      const refreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: rotatingSubClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          ppid_seed: 100,
          refresh_token: accessTokenResult.result.refresh_token,
        },
      });
      expect(refreshTokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      ).toBeUndefined();
      const refreshTokenJWT = decodeJWT(refreshTokenResult.result.access_token);
      expect(refreshTokenJWT.claims.sub).toBeTruthy();

      // The `sub` claims are not compared to each other because on slow CI VMs,
      // the server often forces a time-based rotation.
    });

    it('accepts different ppid_seed when using a refresh_token', async () => {
      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
          ppidSeed: 100,
        }
      );
      expect(tokenResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(tokenResult.result.access_token).error
      ).toBeUndefined();
      const tokenJWT = decodeJWT(tokenResult.result.access_token);

      const clientRotatedResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: rotatingSubClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          ppid_seed: 101,
          refresh_token: tokenResult.result.refresh_token,
        },
      });
      expect(clientRotatedResult.statusCode).toBe(200);
      expect(
        validators.jwt.validate(clientRotatedResult.result.access_token).error
      ).toBeUndefined();
      const clientRotatedJWT = decodeJWT(
        clientRotatedResult.result.access_token
      );

      expect(clientRotatedJWT.claims.sub).not.toBe(tokenJWT.claims.sub);
    });

    it('fails if ppid_seed is invalid', async () => {
      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
          ppidSeed: 'invalid ppid seed',
        }
      );
      expect(tokenResult.statusCode).toBe(400);
      expect(tokenResult.result.errno).toBe(109);
    });
  });
});
