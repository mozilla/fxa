/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');
const { assert } = require('chai');
const nock = require('nock');
const buf = require('buf').hex;
const generateRSAKeypair = require('keypair');
const JWTool = require('fxa-jwtool');
const ScopeSet = require('../../../fxa-shared').oauth.scopes;
const { decodeJWT } = require('../../test/lib/util');

const auth = require('../lib/auth_client_management');
const config = require('../lib/config');
const db = require('../lib/db');
const encrypt = require('../lib/encrypt');
const P = require('../lib/promise');
const testServer = require('./lib/server');
const Server = testServer();
const unique = require('../lib/unique');
const util = require('../lib/util');
const validators = require('../lib/validators');

const assertSecurityHeaders = require('./lib/util').assertSecurityHeaders;

const USERID = unique(16).toString('hex');
const VEMAIL = unique(4).toString('hex') + '@mozilla.com';
const AUTH_AT = Math.floor(Date.now() / 1000);
const AMR = ['pwd', 'email'];
const AAL = 1;
const ACR = 'AAL1';
const PROFILE_CHANGED_AT_LATER_TIME = AUTH_AT + 1000;

function mockVerifierResult(opts) {
  opts = opts || {};
  return JSON.stringify({
    status: opts.status || 'okay',
    email: (opts.uid || USERID) + '@' + config.get('browserid.issuer'),
    issuer: opts.issuer || config.get('browserid.issuer'),
    idpClaims: {
      'fxa-verifiedEmail': opts.vemail || VEMAIL,
      'fxa-lastAuthAt': opts.authAt || AUTH_AT,
      'fxa-generation': opts.generation || 123456,
      'fxa-tokenVerified': opts.hasOwnProperty('tokenVerified')
        ? opts.tokenVerified
        : true,
      'fxa-amr': opts.amr || AMR,
      'fxa-aal': opts.aal || AAL,
      'fxa-profileChangedAt': opts.profileChangedAt,
    },
  });
}

const VERIFY_GOOD = mockVerifierResult();
const VERIFY_GOOD_BUT_UNVERIFIED = mockVerifierResult({ tokenVerified: false });
const VERIFY_FAILURE = '{"status": "failure"}';

const MAX_TTL_S = config.get('expiration.accessToken') / 1000;

const SCOPED_CLIENT_ID = 'aaa6b9b3a65a1871';
const NO_KEY_SCOPES_CLIENT_ID = '38a6b9b3a65a1871';
const NO_ALLOWED_SCOPES_CLIENT_ID = '38a6b9b3a65a1872';
const BAD_CLIENT_ID = '0006b9b3a65a1871';
const SCOPE_CAN_SCOPE_KEY =
  'https://identity.mozilla.com/apps/sample-scope-can-scope-key';

function mockAssertion() {
  var parts = url.parse(config.get('browserid.verificationUrl'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path);
}

function genAssertion(email) {
  var idp = JWTool.JWK.fromPEM(generateRSAKeypair().private, {
    iss: config.get('browserid.issuer'),
  });
  var userPair = generateRSAKeypair();
  var userSecret = JWTool.JWK.fromPEM(userPair.private, {
    iss: config.get('browserid.issuer'),
  });
  var userPublic = JWTool.JWK.fromPEM(userPair.public);
  var now = Date.now();
  var cert = idp.signSync({
    'public-key': userPublic,
    principal: {
      email: email,
    },
    iat: now - 1000,
    exp: now,
    'fxa-verifiedEmail': VEMAIL,
  });
  var assertion = userSecret.signSync({
    aud: 'oauth.fxa',
    exp: now,
  });

  return P.resolve(cert + '~' + assertion);
}

// this matches the hashed secret in config, an assert sanity checks
// lower to make sure it matches
const secret =
  'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
const secretPrevious =
  'ec62e3281e3b56e702fe7e82ca7b1fa59d6c2a6766d6d28cccbf8bfa8d5fc8a8';

var client;
var badSecret;
var clientId;
var AN_ASSERTION;

function authParams(params, options) {
  options = options || {};
  var defaults = {
    assertion: AN_ASSERTION,
    client_id: options.clientId || clientId,
    state: '1',
    scope: 'a',
    acr_values: options.acr_values || undefined,
  };

  params = params || {};
  Object.keys(params).forEach(function(key) {
    defaults[key] = params[key];
  });
  return defaults;
}

function newToken(payload = {}, options = {}) {
  var ttl = payload.ttl || MAX_TTL_S;
  delete payload.ttl;
  mockAssertion().reply(200, options.verifierResponse || VERIFY_GOOD);
  return Server.api
    .post({
      url: '/authorization',
      payload: authParams(payload, options),
    })
    .then(function(res) {
      assert.equal(res.statusCode, 200);
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

function assertInvalidRequestParam(result, param) {
  assert.equal(result.code, 400);
  assert.equal(result.message, 'Invalid request parameter');
  assert.equal(result.validation.keys.length, 1);
  assert.equal(result.validation.keys[0], param);
}

// helper function to create a new user, email and token for some client
/**
 *
 * @param {String} cId - hex client id
 * @param {Object} [options] - custom options
 * @param {Object} [options.uid] - custom uid
 * @param {Object} [options.email] - custom email
 * @param {Object} [options.scopes] - custom scopes
 */
function getUniqueUserAndToken(cId, options) {
  options = options || {};
  if (!cId) {
    throw new Error('No client id set');
  }

  var uid = options.uid || unique(16).toString('hex');
  var email = options.email || unique(4).toString('hex') + '@mozilla.com';

  return db
    .generateAccessToken({
      clientId: buf(cId),
      userId: buf(uid),
      email: email,
      scope: options.scopes
        ? ScopeSet.fromArray(options.scopes)
        : auth.SCOPE_CLIENT_MANAGEMENT,
    })
    .then(function(token) {
      return {
        uid: uid,
        email: email,
        token: token.token.toString('hex'),
      };
    });
}

function clientByName(name) {
  return config.get('clients').reduce(function(client, lastClient) {
    return client.name === name ? client : lastClient;
  });
}

function basicAuthHeader(clientId, secret) {
  return 'Basic ' + Buffer.from(clientId + ':' + secret).toString('base64');
}

describe('/v1', function() {
  before(function(done) {
    P.all([
      genAssertion(USERID + config.get('browserid.issuer')).then(function(ass) {
        AN_ASSERTION = ass;
      }),
      db.ping().then(function() {
        client = clientByName('Mocha');
        clientId = client.id;
        assert.equal(encrypt.hash(secret).toString('hex'), client.hashedSecret);
        assert.equal(
          encrypt.hash(secretPrevious).toString('hex'),
          client.hashedSecretPrevious
        );
        badSecret = Buffer.from(secret, 'hex').slice();
        badSecret[badSecret.length - 1] ^= 1;
        badSecret = badSecret.toString('hex');
      }),
    ]).done(function() {
      done();
    }, done);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('/authorization', function() {
    describe('GET', function() {
      it('redirects with all query params to /authorization', function() {
        return Server.api
          .get(
            '/authorization?client_id=123&state=321&scope=1&action=signup&a=b'
          )
          .then(function(res) {
            assert.equal(res.statusCode, 302);
            assertSecurityHeaders(res);
            var redirect = url.parse(res.headers.location, true);

            assert.equal(redirect.query.action, 'signup');
            assert.equal(redirect.query.client_id, '123');
            assert.equal(redirect.query.state, '321');
            assert.equal(redirect.query.scope, '1');
            // unknown query params are forwarded
            assert.equal(redirect.query.a, 'b');
            var target = url.parse(config.get('contentUrl'), true);
            assert.equal(redirect.pathname, '/authorization');
            assert.equal(redirect.host, target.host);
          });
      });

      it('should fail if keys_jwk specified', () => {
        return Server.api
          .get('/authorization?keys_jwk=xyz&client_id=123&state=321&scope=1')
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.errno, 109);
            assert.equal(res.result.validation, 'keys_jwk');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('content-type', function() {
      it('should fail if unsupported', function() {
        return Server.api
          .post({
            url: '/authorization',
            headers: {
              'content-type': 'text/plain',
            },
            payload: authParams(),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 415);
            assertSecurityHeaders(res);
            assert.equal(res.result.errno, 113);
          });
      });
    });

    describe('untrusted client scope', function() {
      it('should fail if invalid scopes', function() {
        var client = clientByName('Untrusted');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile:write',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.errno, 114);
            assert.ok(res.result.invalidScopes.indexOf('profile:write') !== -1);
          });
      });

      it('should report all invalid scopes', function() {
        var client = clientByName('Untrusted');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile:email profile:locale profile:amr',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.errno, 114);
            assert.ok(res.result.invalidScopes.indexOf('profile:email') === -1);
            assert.ok(
              res.result.invalidScopes.indexOf('profile:locale') !== -1
            );
            assert.ok(res.result.invalidScopes.indexOf('profile:amr') !== -1);
          });
      });

      it('should succeed if valid scope', function() {
        var client = clientByName('Untrusted');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile:email profile:uid',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
          });
      });

      it('should succeed with https:// scopes', function() {
        const scopes =
          'profile:email profile:uid https://identity.mozilla.com/apps/notes https://identity.mozilla.com/apps/lockbox';
        const client = clientByName('Mocha');
        mockAssertion().reply(200, VERIFY_GOOD);

        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: scopes,
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('pkce', function() {
      it('should fail if Public Client is not using code_challenge', function() {
        var client = clientByName('Public Client PKCE');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile profile:write profile:uid',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.errno, 118);
            assert.equal(res.result.error, 'PKCE parameters missing');
          });
      });

      it('should allow Public Clients to direct grant without PKCE', function() {
        var client = clientByName('Admin');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              response_type: 'token',
              scope: 'profile profile:write profile:uid',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
          });
      });

      it('only works with Public Clients', function() {
        var client = clientByName('Mocha');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              scope: 'profile profile:write profile:uid',
              response_type: 'code',
              code_challenge_method: 'S256',
              code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.errno, 116);
            assert.equal(res.result.message, 'Not a public client');
          });
      });
    });

    describe('?client_id', function() {
      it('is required', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: undefined,
            }),
          })
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'client_id');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?assertion', function() {
      it('is required', function() {
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              assertion: undefined,
            }),
          })
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'assertion');
            assertSecurityHeaders(res);
          });
      });

      it('errors correctly if invalid', function() {
        mockAssertion().reply(400, VERIFY_FAILURE);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams(),
          })
          .then(function(res) {
            assert.equal(res.result.code, 401);
            assert.equal(res.result.message, 'Invalid assertion');
            assertSecurityHeaders(res);
          });
      });

      it('succeeds by default when fxa-tokenVerified is false', function() {
        mockAssertion().reply(200, VERIFY_GOOD_BUT_UNVERIFIED);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams(),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
          });
      });

      it('errors when fxa-tokenVerified is false and a scope has keys', function() {
        mockAssertion().reply(200, VERIFY_GOOD_BUT_UNVERIFIED);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: SCOPED_CLIENT_ID,
              scope: SCOPE_CAN_SCOPE_KEY,
            }),
          })
          .then(function(res) {
            assert.equal(res.result.code, 401);
            assert.equal(res.result.message, 'Invalid assertion');
            assertSecurityHeaders(res);
          });
      });

      it('succeeds when fxa-tokenVerified is false and an unknown URL scope is requested', function() {
        mockAssertion().reply(200, VERIFY_GOOD_BUT_UNVERIFIED);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: SCOPED_CLIENT_ID,
              scope: 'https://example.com/unknown-scope',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?redirect_uri', function() {
      it('is optional', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: client.redirectUri,
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert(res.result.redirect);
          });
      });

      it('must be same as registered redirect', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: 'http://localhost:8080/derp',
            }),
          })
          .then(function(res) {
            assert.equal(res.result.code, 400);
            assert.equal(res.result.message, 'Incorrect redirect_uri');
            assertSecurityHeaders(res);
          });
      });

      describe('with config.localRedirects', function() {
        beforeEach(function() {
          config.set('localRedirects', true);
        });

        afterEach(function() {
          config.set('localRedirects', false);
        });

        it('must be same as registered redirect with config set', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                redirect_uri: 'http://bad.uri/derp',
              }),
            })
            .then(function(res) {
              assert.equal(res.result.code, 400);
              assert.equal(res.result.message, 'Incorrect redirect_uri');
              assertSecurityHeaders(res);
            });
        });

        it('can be localhost with config set', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                redirect_uri: 'http://localhost:8080/derp',
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert(res.result.redirect);
            });
        });

        it('validates http and https scheme', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                redirect_uri: 'ftp://localhost:8080/derp',
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
              assert.equal(res.result.errno, 109);
              assert.equal(res.result.message, 'Invalid request parameter');
            });
        });

        it('can be 127.0.0.1 with config set', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                redirect_uri: 'http://127.0.0.1:8080/derp',
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert(res.result.redirect);
            });
        });
      });

      it('can be a URN', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: '98e6508e88680e1b',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            var expected = 'urn:ietf:wg:oauth:2.0:fx:webchannel';
            var actual = res.result.redirect.substr(0, expected.length);
            assert.equal(actual, expected);
          });
      });

      it('can have query parameters', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: 'dcdb5ae7add825d2',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            var expected = 'https://example.domain/return?foo=bar';
            var actual = res.result.redirect.substr(0, expected.length);
            assert.equal(actual, expected);
          });
      });
    });

    describe('?state', function() {
      it('is required', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              state: undefined,
            }),
          })
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'state');
            assertSecurityHeaders(res);
          });
      });

      it('is returned', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              state: 'aa',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.equal(res.result.state, 'aa');
            assert.equal(
              url.parse(res.result.redirect, true).query.state,
              'aa'
            );
          });
      });
    });

    describe('?scope', function() {
      it('is required', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: undefined,
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
          });
      });

      it('is restricted to expected characters', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: 'profile:\u2603',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
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

        assert.strictEqual(res.statusCode, 400);
        assert.equal(res.result.errno, 109);
      });

      it('should fail at /token with hash parameters', async () => {
        const jwtClient = clientByName('JWT Client');
        assert(jwtClient.canGrant); //sanity check
        const clientId = jwtClient.id;
        mockAssertion().reply(200, VERIFY_GOOD);

        const res = await newToken(
          {
            access_type: 'offline',
          },
          {
            clientId: clientId,
            resource: 'https://resource.server.com/#hash=1',
          }
        );

        assert.strictEqual(res.statusCode, 400);
        assert.equal(res.result.errno, 109);
      });
    });

    describe('?response_type', function() {
      it('is optional', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: undefined,
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert(res.result.redirect);
          });
      });

      it('can be code', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'code',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert(res.result.code);
            assert(res.result.redirect);
          });
      });

      it('supports PKCE - code_challenge and code_challenge_method', function() {
        var client = clientByName('Public Client PKCE');
        mockAssertion().reply(200, VERIFY_GOOD);
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
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert(res.result.code);
            assert(res.result.redirect);
          });
      });

      it('supports code_challenge only with code response_type', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'token',
              code_challenge_method: 'S256',
              code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.errno, 109);
          });
      });

      it('must not be something besides code or token', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'foo',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
          });
      });

      it('fails if ttl is specified with code', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              response_type: 'code',
              ttl: 42,
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
          });
      });

      describe('token', function() {
        const client2 = clientByName('Admin');
        assert(client2.canGrant); //sanity check
        const jwtClient = clientByName('JWT Client');
        assert(jwtClient.canGrant); //sanity check
        const ppidClient = clientByName('PPID JWT Client');
        assert(ppidClient.canGrant); //sanity check

        it('does not require state argument', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                state: undefined,
                response_type: 'token',
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
            });
        });

        it('requires scope argument', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                scope: undefined,
                response_type: 'token',
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 400);
            });
        });

        it('requires a client with proper permission', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client.id,
                response_type: 'token',
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
              assert.equal(res.result.errno, 110);
            });
        });

        it('returns an implicit token', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                response_type: 'token',
              }),
            })
            .then(function(res) {
              var defaultExpiresIn =
                config.get('expiration.accessToken') / 1000;
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert(res.result.access_token);
              assert.equal(res.result.token_type, 'bearer');
              assert(res.result.scope);
              assert(res.result.expires_in <= defaultExpiresIn);
              assert(res.result.expires_in > defaultExpiresIn - 10);
              assert(res.result.auth_at);
            });
        });

        it('returns an JWT formatted token in the implicit grant flow', async function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          const res = await Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: jwtClient.id,
              response_type: 'token',
              resource: 'https://resource.server.com',
            }),
          });

          const defaultExpiresIn = config.get('expiration.accessToken') / 1000;
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert(res.result.access_token);
          assert.isNull(validators.jwt.validate(res.result.access_token).error);
          const jwt = decodeJWT(res.result.access_token);
          assert.strictEqual(jwt.claims.sub, USERID);
          assert.deepEqual(jwt.claims.aud, [
            jwtClient.id,
            'https://resource.server.com',
          ]);

          assert.equal(res.result.token_type, 'bearer');
          assert(res.result.scope);
          assert(res.result.expires_in <= defaultExpiresIn);
          assert(res.result.expires_in > defaultExpiresIn - 10);
          assert(res.result.auth_at);
        });

        it('honours the ttl parameter', function() {
          var ttl = 42;
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id,
                response_type: 'token',
                ttl: ttl,
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert(res.result.expires_in <= ttl);
              assert(res.result.expires_in > ttl - 10);
            });
        });
      });
    });

    describe('?keys_jwe', function() {
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
          .then(res => {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.errno, 109);
            assert.equal(res.result.validation.keys[0], 'keys_jwe');
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
            mockAssertion().reply(200, VERIFY_GOOD);
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
              .then(res => {
                assert.equal(res.statusCode, 200);
                return res.result.code;
              });
          })
          .then(code => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: client2.id.toString('hex'),
                code: code,
                code_verifier: code_verifier,
              },
            });
          })
          .then(res => {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.keys_jwe, keys_jwe);
          });
      });
    });

    describe('response', function() {
      describe('with a trusted client', function() {
        it('should redirect to the redirect_uri', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              var loc = url.parse(res.result.redirect, true);
              var expected = url.parse(client.redirectUri, true);
              assert.equal(loc.protocol, expected.protocol);
              assert.equal(loc.host, expected.host);
              assert.equal(loc.pathname, expected.pathname);
              assert.equal(loc.query.foo, expected.query.foo);
              assert(loc.query.code);
              assert.equal(loc.query.code, res.result.code);
            });
        });
      });
    });

    describe('check acr payload', () => {
      it('should throw error if mismatch with claims', () => {
        const options = { aal: 1 };
        const payload = { acr_values: 'AAL2' };
        mockAssertion().reply(200, mockVerifierResult(options));
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams(payload),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.message, 'Mismatch acr value');
            assert.equal(res.result.errno, 120, 'correct errno');
          });
      });

      it('process request when correct acr_values in claims', () => {
        const options = { aal: 2 };
        const payload = { acr_values: 'AAL2' };
        mockAssertion().reply(200, mockVerifierResult(options));
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams(payload),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.ok(res.result.code, 'code set');
            assert.ok(res.result.redirect, 'redirect set');
            assert.equal(res.result.state, 1, 'correct state');
          });
      });
    });
  });

  describe('/token', function() {
    it('disallows GET', function() {
      return Server.api.get('/token').then(function(res) {
        assert.equal(res.statusCode, 404);
        assertSecurityHeaders(res);
      });
    });

    describe('?client_id', function() {
      it('is required', function() {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_secret: secret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'client_id');
            assertSecurityHeaders(res);
          });
      });

      it('is forbidden when authz header provided', function() {
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
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'client_id');
            assertSecurityHeaders(res);
          });
      });

      it('must match an existing client', function() {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_id: '0000000000000000',
              client_secret: secret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function(res) {
            assert.equal(res.result.code, 400);
            assert.equal(res.result.message, 'Unknown client');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('?client_secret', function() {
      it('is required', function() {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_id: clientId,
              code: unique.code().toString('hex'),
            },
          })
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'client_secret');
            assertSecurityHeaders(res);
          });
      });

      it('is forbidden when authz header provided', function() {
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
          .then(function(res) {
            assertInvalidRequestParam(res.result, 'client_secret');
            assertSecurityHeaders(res);
          });
      });

      it('must match server-stored secret', function() {
        return Server.api
          .post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: badSecret,
              code: unique.code().toString('hex'),
            },
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.message, 'Incorrect secret');
          });
      });

      describe('previous secret', function() {
        function getCode(clientId) {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams({
                client_id: clientId,
              }),
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              return res.result.code;
            });
        }

        it('should get auth token with secret', function() {
          return getCode(clientId)
            .then(function(code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: code,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.ok(res.result.access_token);
              assert.equal(res.result.token_type, 'bearer');
              assert.ok(res.result.auth_at);
              assert.ok(res.result.expires_in);
              assert.equal(res.result.scope, 'a');
              assert.equal(res.result.keys_jwe, undefined);
            });
        });

        it('should get auth token with previous secret', function() {
          return getCode(clientId)
            .then(function(code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secretPrevious,
                  code: code,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.ok(res.result.access_token);
            });
        });
      });
    });

    describe('authorization header', function() {
      it('should allow fetching get auth token when the secret is valid', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: clientId,
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            return res.result.code;
          })
          .then(function(code) {
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
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.ok(res.result.access_token);
            assert.equal(res.result.token_type, 'bearer');
            assert.ok(res.result.auth_at);
            assert.ok(res.result.expires_in);
            assert.equal(res.result.scope, 'a');
            assert.equal(res.result.keys_jwe, undefined);
          });
      });

      it('should be rejected if the secret is invalid', function() {
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
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assert.equal(res.result.message, 'Incorrect secret');
          });
      });

      it('should be rejected if the credentials are malformed', function() {
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
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            assertInvalidRequestParam(res.result, 'authorization');
          });
      });
    });

    describe('?grant_type=authorization_code', function() {
      describe('?code', function() {
        it('is required', function() {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
              },
            })
            .then(function(res) {
              assertInvalidRequestParam(res.result, 'code');
              assertSecurityHeaders(res);
            });
        });

        it('must match an existing code', function() {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: unique.code().toString('hex'),
              },
            })
            .then(function(res) {
              assert.equal(res.result.code, 400);
              assert.equal(res.result.message, 'Unknown code');
              assertSecurityHeaders(res);
            });
        });

        it('must be a code owned by this client', function() {
          var secret2 = unique.secret();
          var client2 = {
            name: 'client2',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true,
          };
          return db
            .registerClient(client2)
            .then(function() {
              mockAssertion().reply(200, VERIFY_GOOD);
              return Server.api
                .post({
                  url: '/authorization',
                  payload: authParams({
                    client_id: client2.id.toString('hex'),
                  }),
                })
                .then(function(res) {
                  assert.equal(res.statusCode, 200);
                  assertSecurityHeaders(res);
                  return res.result.code;
                });
            })
            .then(function(code) {
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
            .then(function(res) {
              assert.equal(res.result.code, 400);
              assert.equal(res.result.message, 'Incorrect code');
              assertSecurityHeaders(res);
            });
        });

        describe('when used by a public client (PKCE)', function() {
          var code_verifier = 'WFX-9dPwcpPIXt8c5Pbx09_Z61zPm1Fjwv89lVrukOh';
          var code_verifier_bad = 'QnuuNM5gfnJmWwIjiOKk2SKn8A89tph3-8BjNUUtooJ';
          var code_challenge = 'xWVKKAQVD9XSXT4Z4Oh8dLJ5pqrr0gQes2QwZOVJyAk';
          var secret2 = unique.secret();
          var client2 = {
            name: 'client2Public',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true,
            publicClient: true,
          };

          before(function() {
            return db.registerClient(client2);
          });

          it('consumes code when provided correct code_verifier', function() {
            mockAssertion().reply(200, VERIFY_GOOD);
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
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                assertSecurityHeaders(res);
                return res.result.code;
              })
              .then(function(code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier,
                  },
                });
              })
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                assert.ok(res.result.access_token);
                assert.ok(res.result.scope);
                assert.equal(res.result.token_type, 'bearer');
                assert.ok(res.result.access_token);
                assert.equal(res.result.keys_jwe, undefined);
              });
          });

          it('rejects invalid code_verifier', function() {
            mockAssertion().reply(200, VERIFY_GOOD);
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
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                assertSecurityHeaders(res);
                return res.result.code;
              })
              .then(function(code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier_bad,
                  },
                });
              })
              .then(function(res) {
                assert.equal(res.statusCode, 400);
                assert.equal(res.result.errno, 117);
                assert.equal(res.result.message, 'Incorrect code_challenge');
              });
          });

          it('must not have expired', function() {
            this.slow(200);
            var exp = config.get('expiration.code');
            config.set('expiration.code', 50);
            mockAssertion().reply(200, VERIFY_GOOD);
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
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                return res.result.code;
              })
              .delay(60)
              .then(function(code) {
                return Server.api.post({
                  url: '/token',
                  payload: {
                    client_id: client2.id.toString('hex'),
                    code: code,
                    code_verifier: code_verifier,
                  },
                });
              })
              .then(function(res) {
                assert.equal(res.result.code, 400);
                assert.equal(res.result.message, 'Expired code');
                assertSecurityHeaders(res);
              })
              .finally(function() {
                config.set('expiration.code', exp);
              });
          });

          it('must be a code owned by this client', function() {
            var client3 = {
              name: 'client3Public',
              hashedSecret: encrypt.hash(secret2),
              redirectUri: 'https://example.domain',
              imageUri: 'https://example.foo.domain/logo.png',
              trusted: true,
              publicClient: true,
            };
            return db
              .registerClient(client3)
              .then(function() {
                mockAssertion().reply(200, VERIFY_GOOD);
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
                  .then(function(res) {
                    assert.equal(res.statusCode, 200);
                    assertSecurityHeaders(res);
                    return res.result.code;
                  });
              })
              .then(function(code) {
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
              .then(function(res) {
                assert.equal(res.result.code, 400);
                assert.equal(res.result.message, 'Incorrect code');
                assertSecurityHeaders(res);
              });
          });
        });

        it('must not have expired', function() {
          this.slow(200);
          var exp = config.get('expiration.code');
          config.set('expiration.code', 50);
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function(res) {
              return res.result.code;
            })
            .delay(60)
            .then(function(code) {
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: code,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.result.code, 400);
              assert.equal(res.result.message, 'Expired code');
              assertSecurityHeaders(res);
            })
            .finally(function() {
              config.set('expiration.code', exp);
            });
        });

        it('cannot use the same code multiple times', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function(res) {
              return res.result.code;
            })
            .then(function(code) {
              return Server.api
                .post({
                  url: '/token',
                  payload: {
                    client_id: clientId,
                    client_secret: secret,
                    code: code,
                  },
                })
                .then(function(res) {
                  assert.equal(res.statusCode, 200);
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
            .then(function(res) {
              assert.equal(res.result.code, 400);
              assert.equal(res.result.message, 'Unknown code');
              assertSecurityHeaders(res);
            });
        });

        it('does not accept a `scope` parameter', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api
            .post({
              url: '/authorization',
              payload: authParams(),
            })
            .then(function(res) {
              return res.result.code;
            })
            .then(function(code) {
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
            .then(function(res) {
              assert.equal(res.result.code, 400);
              assert.equal(res.result.errno, 109);
              assert.deepEqual(res.result.validation, {
                source: 'payload',
                keys: ['scope'],
              });
              assertSecurityHeaders(res);
            });
        });
      });

      describe('response', function() {
        describe('access_type=online', function() {
          it('should return a correct response', function() {
            mockAssertion().reply(200, VERIFY_GOOD);
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  scope: 'foo bar bar',
                }),
              })
              .then(function(res) {
                assert.equal(res.statusCode, 200);
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
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                assertSecurityHeaders(res);
                assert.equal(res.result.token_type, 'bearer');
                assert(res.result.access_token);
                assert(!res.result.refresh_token);
                assert.equal(
                  res.result.access_token.length,
                  config.get('unique.token') * 2
                );
                assert.equal(res.result.scope, 'foo bar');
                assert.equal(res.result.auth_at, AUTH_AT);
              });
          });
        });

        describe('access_type=offline', function() {
          it('should return a correct response', function() {
            mockAssertion().reply(200, VERIFY_GOOD);
            return Server.api
              .post({
                url: '/authorization',
                payload: authParams({
                  scope: 'foo bar bar',
                  access_type: 'offline',
                }),
              })
              .then(function(res) {
                assert.equal(res.statusCode, 200);
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
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                assertSecurityHeaders(res);
                assert.equal(res.result.token_type, 'bearer');
                assert(res.result.access_token);
                assert(res.result.refresh_token);
                assert.equal(
                  res.result.access_token.length,
                  config.get('unique.token') * 2
                );
                assert.equal(
                  res.result.refresh_token.length,
                  config.get('unique.token') * 2
                );
                assert.equal(res.result.scope, 'foo bar');
                assert.equal(res.result.auth_at, AUTH_AT);
              });
          });
        });
      });

      it('with a blank scope', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: '',
            }),
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
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
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.equal(res.result.token_type, 'bearer');
            assert(res.result.access_token);
            assert.equal(
              res.result.access_token.length,
              config.get('unique.token') * 2
            );
            assert.equal(res.result.scope, '');
          });
      });
    });

    describe('?grant_type=refresh_token', function() {
      describe('?refresh_token', function() {
        it('should be required', function() {
          return Server.api
            .post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
              },
            })
            .then(function(res) {
              assertInvalidRequestParam(res.result, 'refresh_token');
              assertSecurityHeaders(res);
            });
        });

        it('can refresh a token as a Public (PKCE) Client', function() {
          var clientId = NO_KEY_SCOPES_CLIENT_ID;
          var clientSecret =
            'd914ea58d579ec907a1a40b19fb3f3a631461fe00e494521d41c0496f49d288f';
          var refresh;
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
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              refresh = res.result.refresh_token;
              assert(refresh);
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
            .then(function(res) {
              assert.equal(
                res.statusCode,
                400,
                'client_secret must not be set'
              );
              assert.equal(res.result.errno, 109);
              assert.equal(res.result.refresh_token, undefined);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  grant_type: 'refresh_token',
                  refresh_token: refresh,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assert(res.result.expires_in);
              assert(res.result.access_token);
              assert.equal(res.result.refresh_token, undefined);
            });
        });

        it('should be an existing token', function() {
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
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
              assert.equal(res.result.errno, 108);
            });
        });

        it('should be owned by the client_id', function() {
          var id2;
          var secret2 = unique.secret();
          var client2 = {
            name: 'client2',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true,
          };
          return db
            .registerClient(client2)
            .then(function(c) {
              id2 = c.id.toString('hex');
              return newToken({ access_type: 'offline' }); //for main client
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              var refresh = res.result.refresh_token;
              assert(refresh);
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
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
              assert.equal(res.result.errno, 108, 'invalid token');
            });
        });

        it('should not create a new refresh token', function() {
          return newToken({ access_type: 'offline' })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
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
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.refresh_token, undefined);
            });
        });
      });

      describe('?scope', function() {
        it('should default to returning the scopes that were originally requested', function() {
          return newToken({
            access_type: 'offline',
            scope: 'foo bar:baz',
          })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.scope, 'foo bar:baz');
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
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.scope, 'foo bar:baz');
            });
        });

        it('should be able to reduce scopes', function() {
          return newToken({
            access_type: 'offline',
            scope: 'foo bar:baz',
          })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.scope, 'foo bar:baz');
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                  scope: 'foo',
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.scope, 'foo');
            });
        });

        it('should not expand scopes', function() {
          return newToken({
            access_type: 'offline',
            scope: 'foo bar:baz',
          })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.scope, 'foo bar:baz');
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                  scope: 'foo quux',
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
              assert.equal(res.result.errno, 114);
            });
        });

        it('should not expand read scope to write scope', function() {
          return newToken({
            access_type: 'offline',
            scope: 'foo',
          })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.result.scope, 'foo');
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  grant_type: 'refresh_token',
                  refresh_token: res.result.refresh_token,
                  scope: 'foo:write',
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
              assert.equal(res.result.errno, 114);
            });
        });
      });

      describe('?ttl', function() {
        it('should reduce the expires_in of the access_token', function() {
          return newToken({ access_type: 'offline' })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
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
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert(res.result.expires_in <= 60);
            });
        });

        it('should not exceed the maximum', function() {
          return newToken({ access_type: 'offline' })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
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
            .then(function(res) {
              assertInvalidRequestParam(res.result, 'ttl');
              assertSecurityHeaders(res);
            });
        });
      });
    });

    describe('?grant_type=fxa-credentials', function() {
      const clientId = '98e6508e88680e1a';

      it('assertion param should be required', async () => {
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
          },
        });
        assertInvalidRequestParam(res.result, 'assertion');
        assertSecurityHeaders(res);
      });

      it('can directly grant a token with valid assertion', async () => {
        mockAssertion().reply(200, VERIFY_GOOD);
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile testme',
            assertion: AN_ASSERTION,
          },
        });
        assert.equal(res.statusCode, 200);
        assert.ok(res.result.expires_in);
        assert.ok(res.result.access_token);
        assert.equal(res.result.scope, 'profile testme');
        assert.equal(res.result.refresh_token, undefined);
      });

      it('can create a refresh token if requested', async () => {
        mockAssertion().reply(200, VERIFY_GOOD);
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile testme',
            access_type: 'offline',
            assertion: AN_ASSERTION,
          },
        });
        assertSecurityHeaders(res);
        assert.equal(res.statusCode, 200);
        assert.ok(res.result.expires_in);
        assert.ok(res.result.access_token);
        assert.equal(res.result.scope, 'profile testme');
        assert.ok(res.result.refresh_token);
      });

      it('accepts configurable ttl', async () => {
        mockAssertion().reply(200, VERIFY_GOOD);
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            ttl: 42,
            assertion: AN_ASSERTION,
          },
        });
        assertSecurityHeaders(res);
        assert.equal(res.statusCode, 200);
        assert(res.result.expires_in <= 42);
      });

      it('rejects invalid assertions', async () => {
        mockAssertion().reply(400, VERIFY_FAILURE);
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            scope: 'profile testme',
            access_type: 'offline',
            assertion: AN_ASSERTION,
          },
        });
        assertSecurityHeaders(res);
        assert.equal(res.statusCode, 401);
        assert.equal(res.result.message, 'Invalid assertion');
      });

      it('rejects clients that are not allowed to grant', async () => {
        const clientId = NO_KEY_SCOPES_CLIENT_ID;
        const res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            grant_type: 'fxa-credentials',
            assertion: AN_ASSERTION,
          },
        });
        assertSecurityHeaders(res);
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'Invalid grant_type');
      });

      it('rejects disallowed scopes', async () => {
        mockAssertion().reply(200, VERIFY_GOOD);
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
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.message, 'Requested scopes are not allowed');
      });
    });

    describe('?scope=openid', function() {
      it("should return an id_token with user's sub if PPID not enabled for client", () => {
        return newToken({ scope: 'openid' }).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert(res.result.access_token);
          assert(res.result.id_token);
          const jwt = decodeJWT(res.result.id_token);
          const header = jwt.header;
          const claims = jwt.claims;

          assert.equal(header.alg, 'RS256');
          assert.equal(header.kid, config.get('openid.key').kid);

          assert.equal(claims.sub, USERID);
          assert.equal(claims.aud, clientId);
          assert.equal(claims.iss, config.get('openid.issuer'));
          const now = Math.floor(Date.now() / 1000);
          assert(claims.iat <= now);
          assert(claims.exp > now);
          assert.deepEqual(claims.amr, AMR);
          assert.equal(claims.acr, ACR);
          assert.equal(claims['fxa-aal'], AAL);

          const at_hash = util.generateTokenHash(res.result.access_token);
          assert.equal(claims.at_hash, at_hash);
        });
      });

      it('should return an id_token that propagates `resource` and `clientId` in the `aud` claim', () => {
        return newToken(
          { scope: 'openid' },
          { resource: 'https://resource.server1.com' }
        ).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert(res.result.access_token);
          assert(res.result.id_token);
          const jwt = decodeJWT(res.result.id_token);
          const claims = jwt.claims;

          assert.deepEqual(claims.aud, [
            clientId,
            'https://resource.server1.com',
          ]);
        });
      });

      it('should return an id_token with ppid sub if PPID is enabled for client', () => {
        const ppidClient = clientByName('PPID JWT Client');

        return newToken({ scope: 'openid' }, { clientId: ppidClient.id }).then(
          res => {
            assert.equal(res.statusCode, 200);
            const { claims } = decodeJWT(res.result.id_token);
            assert.notEqual(claims.sub, USERID);
            assert.lengthOf(claims.sub, USERID.length);
          }
        );
      });

      it('should omit amr claim when not given in the assertion', () => {
        let verifierResponse = JSON.parse(VERIFY_GOOD);
        delete verifierResponse.idpClaims['fxa-amr'];
        verifierResponse = JSON.stringify(verifierResponse);
        return newToken({ scope: 'openid' }, { verifierResponse }).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert(res.result.id_token);
          const jwt = decodeJWT(res.result.id_token);
          const claims = jwt.claims;

          assert.equal(claims.sub, USERID);
          assert.equal(claims.aud, clientId);
          assert.equal(claims.iss, config.get('openid.issuer'));
          assert.equal(claims.amr, undefined);
          assert.equal(claims.acr, ACR);
          assert.equal(claims['fxa-aal'], AAL);
        });
      });

      it('should omit acr and fxa-aal claims when not given in the assertion', () => {
        let verifierResponse = JSON.parse(VERIFY_GOOD);
        delete verifierResponse.idpClaims['fxa-aal'];
        verifierResponse = JSON.stringify(verifierResponse);
        return newToken({ scope: 'openid' }, { verifierResponse }).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert(res.result.id_token);
          const jwt = decodeJWT(res.result.id_token);
          const claims = jwt.claims;

          assert.equal(claims.sub, USERID);
          assert.equal(claims.aud, clientId);
          assert.equal(claims.iss, config.get('openid.issuer'));
          assert.deepEqual(claims.amr, AMR);
          assert.equal(claims.acr, undefined);
          assert.equal(claims['fxa-aal'], undefined);
        });
      });

      it('should be available to untrusted reliers', function() {
        const client = clientByName('Untrusted');
        return newToken({ scope: 'openid' }, { client_id: client.id }).then(
          res => {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert(res.result.access_token);
            assert(res.result.id_token);
          }
        );
      });
    });

    describe('?redirect_uri', () => {
      function getCode(clientId) {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              client_id: clientId,
            }),
          })
          .then(res => {
            return res.result.code;
          });
      }
      it('works with https redirect_uri', () => {
        return getCode(clientId)
          .then(code => {
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
          .then(res => {
            assert.equal(res.statusCode, 200);
          });
      });

      it('works with app redirect_uri', () => {
        return getCode(clientId)
          .then(code => {
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
          .then(res => {
            assert.equal(res.statusCode, 200);
          });
      });

      it('works with query parameters', () => {
        return getCode(clientId)
          .then(code => {
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
          .then(res => {
            assert.equal(res.statusCode, 200);
          });
      });

      it('is validated', () => {
        return getCode(clientId)
          .then(code => {
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
          .then(res => {
            assert.equal(res.statusCode, 400);
            assertInvalidRequestParam(res.result, 'redirect_uri');
            assertSecurityHeaders(res);
          });
      });
    });
  });

  describe('/client', function() {
    var clientName = 'test/api/client';
    var clientUri = 'http://test.api/client';

    var tok;
    var badTok;

    before(function() {
      return db
        .generateAccessToken({
          clientId: buf(clientId),
          userId: buf(USERID),
          email: VEMAIL,
          scope: auth.SCOPE_CLIENT_MANAGEMENT,
        })
        .then(function(token) {
          tok = token.token.toString('hex');
          return db.generateAccessToken({
            clientId: buf(clientId),
            userId: unique(16),
            email: 'user@not.allow.ed',
            scope: auth.SCOPE_CLIENT_MANAGEMENT,
          });
        })
        .then(function(token) {
          badTok = token.token.toString('hex');
        });
    });

    describe('GET /:id', function() {
      describe('response', function() {
        it('should return the correct response', function() {
          return Server.api.get('/client/' + clientId).then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            var body = res.result;
            assert.equal(body.name, client.name);
            assert(body.image_uri);
            assert(body.redirect_uri);
            assert(body.trusted);
          });
        });

        it('should error for unknown clients', () => {
          return Server.api.get('/client/100200300').then(res => {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
            const body = res.result;
            assert.equal(body.errno, 109);
            assert.equal(body.message, 'Invalid request parameter');
          });
        });
      });

      it('should allow for clients with no redirect_uri', function() {
        return Server.api.get('/client/ea3ca969f8c6bb0d').then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          var body = res.result;
          assert(body.name);
          assert.equal(body.image_uri, '');
          assert.equal(body.redirect_uri, '');
        });
      });
    });

    describe('client management api', function() {
      it('can be disabled', () => {
        const ServerWithoutClientManagement = testServer({
          clientManagement: {
            enabled: false,
          },
        });

        return P.all([
          ServerWithoutClientManagement.api.get('/clients'),
          ServerWithoutClientManagement.api.post('/client'),
          ServerWithoutClientManagement.api.post('/client/' + clientId),
          ServerWithoutClientManagement.api.delete('/client/' + clientId),
        ]).map(res => {
          assert.equal(res.statusCode, 404);
          assertSecurityHeaders(res);
        });
      });

      it('can be enabled', () => {
        const ServerWithClientManagement = testServer({
          clientManagement: {
            enabled: true,
          },
        });

        return P.all([
          ServerWithClientManagement.api.get('/clients'),
          ServerWithClientManagement.api.post('/client'),
          ServerWithClientManagement.api.post('/client/' + clientId),
          ServerWithClientManagement.api.delete('/client/' + clientId),
        ]).map(res => {
          assert.equal(res.statusCode, 401);
          assertSecurityHeaders(res);
        });
      });

      it('is enabled by default in tests', () => {
        const ServerWithClientManagement = testServer();

        return P.all([
          ServerWithClientManagement.api.get('/clients'),
          ServerWithClientManagement.api.post('/client'),
          ServerWithClientManagement.api.post('/client/' + clientId),
          ServerWithClientManagement.api.delete('/client/' + clientId),
        ]).map(res => {
          assert.equal(res.statusCode, 401);
          assertSecurityHeaders(res);
        });
      });

      describe('GET /client/:id', function() {
        describe('response', function() {
          it('should support the client id path', function() {
            return Server.api.get('/client/' + clientId).then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              var body = res.result;
              assert.equal(body.name, client.name);
              assert(body.image_uri);
              assert(body.redirect_uri);
            });
          });
        });
      });

      describe('GET /clients', function() {
        it('should require authorization', function() {
          return Server.api
            .get({
              url: '/clients',
            })
            .then(function(res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
            });
        });

        it('should check whether the user is allowed', function() {
          return Server.api
            .get({
              url: '/clients',
              headers: {
                authorization: 'Bearer ' + badTok,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 403);
              assertSecurityHeaders(res);
            });
        });

        it('should return an empty list of clients', function() {
          // this developer has no clients associated, it returns 0
          // value is the same as the API endpoint and a DB call

          return Server.api
            .get({
              url: '/clients',
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);

              return db.getClients(VEMAIL).then(function(clients) {
                assert.equal(res.result.clients.length, clients.length);
                assert.equal(res.result.clients.length, 0);
              });
            });
        });

        it('should return a list of clients for a developer', function() {
          var vemail, tok;

          return getUniqueUserAndToken(clientId)
            .then(function(data) {
              tok = data.token;
              vemail = data.email;
              // make this user a developer
              return db.activateDeveloper(vemail);
            })
            .then(function() {
              return db.getDeveloper(vemail);
            })
            .then(function(developer) {
              var devId = developer.developerId;
              return db.registerClientDeveloper(devId, clientId);
            })
            .then(function() {
              return Server.api.get({
                url: '/clients',
                headers: {
                  authorization: 'Bearer ' + tok,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              return db.getClients(vemail).then(function(clients) {
                assert.equal(res.result.clients.length, clients.length);
                assert.equal(res.result.clients.length, 1);
              });
            });
        });
      });

      describe('POST', function() {
        before(function() {
          return Server.api
            .post({
              url: '/developer/activate',
              headers: {
                authorization: 'Bearer ' + tok,
              },
            })
            .then(function(res) {});
        });

        it('should register a client', function() {
          return Server.api
            .post({
              url: '/client',
              headers: {
                authorization: 'Bearer ' + tok,
              },
              payload: {
                name: clientName,
                redirect_uri: clientUri,
                image_uri: clientUri + '/image',
                can_grant: true,
                trusted: true,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 201);
              assertSecurityHeaders(res);
              var client = res.result;
              assert(client.id);
              return db.getClient(client.id).then(function(klient) {
                assert.equal(klient.id.toString('hex'), client.id);
                assert.equal(klient.name, client.name);
                assert.equal(klient.redirectUri, client.redirect_uri);
                assert.equal(klient.imageUri, client.image_uri);
                assert.equal(klient.redirectUri, clientUri);
                assert.equal(klient.imageUri, clientUri + '/image');
                assert.equal(klient.canGrant, true);
                assert.equal(klient.trusted, true);
              });
            });
        });

        it('should require authorization', function() {
          return Server.api
            .post({
              url: '/client',
              payload: {
                name: 'dont matter',
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
            });
        });

        it('should check the whether the user is allowed', function() {
          return Server.api
            .post({
              url: '/client',
              headers: {
                authorization: 'Bearer ' + badTok,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 403);
              assertSecurityHeaders(res);
            });
        });

        it('should default optional fields to sensible values', function() {
          return Server.api
            .post({
              url: '/client',
              headers: {
                authorization: 'Bearer ' + tok,
              },
              payload: {
                name: clientName,
                redirect_uri: clientUri,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 201);
              assertSecurityHeaders(res);
              var client = res.result;
              assert(client.id);
              assert(client.image_uri === '');
              assert(client.can_grant === false);
              assert(client.trusted === false);
              return db.getClient(client.id).then(function(klient) {
                assert.equal(klient.id.toString('hex'), client.id);
                assert.equal(klient.name, client.name);
                assert.equal(klient.imageUri, '');
                assert.equal(klient.canGrant, false);
                assert.equal(klient.trusted, false);
              });
            });
        });
      });

      describe('POST /:id', function() {
        var id = unique.id();

        it('should forbid update to unknown developers', function() {
          var vemail, tok;
          var id = unique.id();
          var client = {
            name: 'test/api/update',
            id: id,
            hashedSecret: encrypt.hash(unique.secret()),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.com/logo.png',
            trusted: true,
          };

          return db
            .registerClient(client)
            .then(function() {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            })
            .then(function() {
              return db.getDeveloper(vemail);
            })
            .then(function(developer) {})
            .then(function() {
              return Server.api.post({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
                payload: {
                  name: 'updated',
                  redirect_uri: clientUri,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
            });
        });

        it('should allow client update', function() {
          var vemail, tok, devId;
          var id = unique.id();
          var client = {
            name: 'test/api/update2',
            id: id,
            hashedSecret: encrypt.hash(unique.secret()),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.com/logo.png',
            trusted: true,
          };

          return db
            .registerClient(client)
            .then(function() {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            })
            .then(function() {
              return db.getDeveloper(vemail);
            })
            .then(function(developer) {
              devId = developer.developerId;
            })
            .then(function() {
              return db.registerClientDeveloper(
                devId.toString('hex'),
                id.toString('hex')
              );
            })
            .then(function() {
              return Server.api.post({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
                payload: {
                  name: 'updated',
                  redirect_uri: clientUri,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 200);
              assertSecurityHeaders(res);
              assert.equal(res.payload, '{}');
              return db.getClient(client.id);
            })
            .then(function(klient) {
              assert.equal(klient.name, 'updated');
              assert.equal(klient.redirectUri, clientUri);
              assert.equal(klient.imageUri, client.imageUri);
              assert.equal(klient.trusted, true);
              assert.equal(klient.canGrant, false);
            });
        });

        it('should forbid unknown properties', function() {
          return Server.api
            .post({
              url: '/client/' + id.toString('hex'),
              headers: {
                authorization: 'Bearer ' + tok,
              },
              payload: {
                foo: 'bar',
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 400);
              assertSecurityHeaders(res);
            });
        });

        it('should require authorization', function() {
          return Server.api
            .post({
              url: '/client/' + id.toString('hex'),
              payload: {
                name: 'dont matter',
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
            });
        });

        it('should check the whether the user is allowed', function() {
          return Server.api
            .post({
              url: '/client/' + id.toString('hex'),
              headers: {
                authorization: 'Bearer ' + badTok,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 403);
              assertSecurityHeaders(res);
            });
        });
      });

      describe('DELETE /:id', function() {
        it('should delete the client', function() {
          var vemail, tok, devId;
          var id = unique.id();
          var client = {
            name: 'test/api/deleteOwner',
            id: id,
            hashedSecret: encrypt.hash(unique.secret()),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.com/logo.png',
            trusted: true,
          };

          return db
            .registerClient(client)
            .then(function() {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            })
            .then(function() {
              return db.getDeveloper(vemail);
            })
            .then(function(developer) {
              devId = developer.developerId;
            })
            .then(function() {
              return db.registerClientDeveloper(
                devId.toString('hex'),
                id.toString('hex')
              );
            })
            .then(function() {
              return Server.api.delete({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 204);
              assertSecurityHeaders(res);
              return db.getClient(id);
            })
            .then(function(client) {
              assert.equal(client, undefined);
            });
        });

        it('should not delete the client if not owner', function() {
          var vemail, tok;
          var id = unique.id();
          var client = {
            name: 'test/api/deleteOwner',
            id: id,
            hashedSecret: encrypt.hash(unique.secret()),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.com/logo.png',
            trusted: true,
          };

          return db
            .registerClient(client)
            .then(function() {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            })
            .then(function() {
              return db.getDeveloper(vemail);
            })
            .then(function(developer) {})
            .then(function() {
              return Server.api.delete({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
              });
            })
            .then(function(res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
              return db.getClient(id);
            })
            .then(function(klient) {
              assert.equal(klient.id.toString('hex'), id.toString('hex'));
            });
        });

        it('should require authorization', function() {
          var id = unique.id();

          return Server.api
            .delete({
              url: '/client/' + id.toString('hex'),
              payload: {
                name: 'dont matter',
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 401);
              assertSecurityHeaders(res);
            });
        });

        it('should check the whether the user is allowed', function() {
          var id = unique.id();

          return Server.api
            .delete({
              url: '/client/' + id.toString('hex'),
              headers: {
                authorization: 'Bearer ' + badTok,
              },
            })
            .then(function(res) {
              assert.equal(res.statusCode, 403);
              assertSecurityHeaders(res);
            });
        });
      });
    });

    describe('POST /key-data', function() {
      let genericRequest;

      beforeEach(function() {
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
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(
            Object.keys(res.result).length,
            1,
            'only one scope returned'
          );

          const body = res.result[SCOPE_CAN_SCOPE_KEY];

          assert.equal(
            body.identifier,
            'https://identity.mozilla.com/apps/sample-scope-can-scope-key'
          );
          assert.equal(
            body.keyRotationSecret,
            '0000000000000000000000000000000000000000000000000000000000000000'
          );
          assert.equal(body.keyRotationTimestamp, 123456);
        });
      });

      it('works with multiple scopes', () => {
        mockAssertion().reply(200, VERIFY_GOOD);
        const ANOTHER_CAN_SCOPE_KEY =
          'https://identity.mozilla.com/apps/another-can-scope-key';
        genericRequest.payload.scope = `${SCOPE_CAN_SCOPE_KEY} ${ANOTHER_CAN_SCOPE_KEY}`;

        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(
            Object.keys(res.result).length,
            2,
            'two scopes returned'
          );

          const keyOne = res.result[SCOPE_CAN_SCOPE_KEY];
          const keyTwo = res.result[ANOTHER_CAN_SCOPE_KEY];

          assert.equal(keyOne.identifier, SCOPE_CAN_SCOPE_KEY);
          assert.equal(
            keyOne.keyRotationSecret,
            '0000000000000000000000000000000000000000000000000000000000000000'
          );
          assert.equal(keyOne.keyRotationTimestamp, 123456);

          assert.equal(keyTwo.identifier, ANOTHER_CAN_SCOPE_KEY);
          assert.equal(
            keyTwo.keyRotationSecret,
            '0000000000000000000000000000000000000000000000000000000000000000'
          );
          assert.equal(keyTwo.keyRotationTimestamp, 123456);
        });
      });

      it('fails with non-existent client_id', () => {
        genericRequest.payload.client_id = BAD_CLIENT_ID;
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 400);
          assertSecurityHeaders(res);
          const body = res.result;
          assert.equal(body.errno, 101);
          assert.equal(body.message, 'Unknown client');
        });
      });

      it('succeeds with a non-scoped-key scope', () => {
        genericRequest.payload.scope =
          'https://identity.mozilla.com/apps/sample-scope';
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(Object.keys(res.result).length, 0, 'no scoped keys');
        });
      });

      it('succeeds with scopes that arent explicitly defined in config', () => {
        genericRequest.payload.scope += ' kv';
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.deepEqual(
            Object.keys(res.result),
            [SCOPE_CAN_SCOPE_KEY],
            'undefined scope is ignored'
          );
        });
      });

      it('fails with bad assertion', () => {
        mockAssertion().reply(200, VERIFY_FAILURE);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 401);
          assertSecurityHeaders(res);
          const body = res.result;
          assert.equal(body.message, 'Invalid assertion');
        });
      });

      it('fails for clients that are not allowed the requested scope', () => {
        genericRequest.payload.client_id = NO_KEY_SCOPES_CLIENT_ID;

        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 400);
          assert.equal(res.result.message, 'Requested scopes are not allowed');
          assertSecurityHeaders(res);
        });
      });

      it('fails for clients that have no allowedScopes', () => {
        genericRequest.payload.client_id = NO_ALLOWED_SCOPES_CLIENT_ID;

        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 400);
          assert.equal(res.result.message, 'Requested scopes are not allowed');
          assertSecurityHeaders(res);
        });
      });

      it('correctly handles authAt timestamp for newly-created accounts', () => {
        mockAssertion().reply(
          200,
          mockVerifierResult({
            authAt: 1549910733,
            generation: 1549910733629,
          })
        );
        return Server.api.post(genericRequest).then(res => {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(
            Object.keys(res.result).length,
            1,
            'scoped key returned'
          );
        });
      });
    });
  });

  describe('/developer', function() {
    describe('POST /developer/activate', function() {
      it('should create a developer', function() {
        var vemail, tok;

        return getUniqueUserAndToken(clientId)
          .then(function(data) {
            tok = data.token;
            vemail = data.email;

            return db.getDeveloper(vemail);
          })
          .then(function(developer) {
            assert.equal(developer, null);

            return Server.api.post({
              url: '/developer/activate',
              headers: {
                authorization: 'Bearer ' + tok,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.equal(res.result.email, vemail);
            assert(res.result.developerId);
            assert(res.result.createdAt);

            return db.getDeveloper(vemail);
          })
          .then(function(developer) {
            assert.equal(developer.email, vemail);
          });
      });
    });

    describe('GET /developer', function() {
      it('should not exist', function() {
        return Server.api.get('/developer').then(function(res) {
          assert.equal(res.statusCode, 404);
          assertSecurityHeaders(res);
        });
      });
    });
  });

  describe('/verify', function() {
    describe('unknown token', function() {
      it('should not error', function() {
        return Server.api
          .post({
            url: '/verify',
            payload: {
              token: unique.token().toString('hex'),
            },
          })
          .then(function(res) {
            assert.equal(res.statusCode, 400);
            assertSecurityHeaders(res);
          });
      });
    });

    it('should reject expired tokens from after the epoch', function() {
      this.slow(2200);
      var epoch = config.get('expiration.accessTokenExpiryEpoch');
      config.set('expiration.accessTokenExpiryEpoch', Date.now());
      return newToken({
        ttl: 1,
      })
        .delay(1500)
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(res.result.expires_in, 1);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 400);
          assertSecurityHeaders(res);
          assert.equal(res.result.errno, 115);
        })
        .finally(function() {
          config.set('expiration.accessTokenExpiryEpoch', epoch);
        });
    });

    it('should accept expired tokens from before the epoch', function() {
      this.slow(2200);
      var epoch = config.get('expiration.accessTokenExpiryEpoch');
      config.set('expiration.accessTokenExpiryEpoch', Date.now() + 2000);
      return newToken({
        ttl: 1,
      })
        .delay(1500)
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(res.result.expires_in, 1);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
        })
        .finally(function() {
          config.set('expiration.accessTokenExpiryEpoch', epoch);
        });
    });

    describe('response', function() {
      it('should return the correct response', function() {
        return newToken({ scope: 'profile' })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            return Server.api.post({
              url: '/verify',
              payload: {
                token: res.result.access_token,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.equal(res.result.user, USERID);
            assert.equal(res.result.client_id, clientId);
            assert.equal(res.result.scope[0], 'profile');
            assert.equal(res.result.email, undefined);
            assert.equal(res.result.profile_changed_at, undefined);
          });
      });

      it('should return profile_changed_at when set', function() {
        const verifierResponse = mockVerifierResult({
          profileChangedAt: PROFILE_CHANGED_AT_LATER_TIME,
        });
        return newToken({ scope: 'profile' }, { verifierResponse })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            return Server.api.post({
              url: '/verify',
              payload: {
                token: res.result.access_token,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assertSecurityHeaders(res);
            assert.equal(res.result.user, USERID);
            assert.equal(res.result.client_id, clientId);
            assert.equal(res.result.scope[0], 'profile');
            assert.equal(res.result.email, undefined);
            assert.equal(
              res.result.profile_changed_at,
              PROFILE_CHANGED_AT_LATER_TIME,
              'profile changed at is set'
            );
          });
      });
    });

    it('should not return the email by default for profile:email scope', function() {
      return newToken({ scope: 'profile:email' })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(res.result.email, undefined);
        });
    });

    it('should not return email for payload having email:false', function() {
      return newToken({ scope: 'profile:email' })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
              email: false,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(res.result.email, undefined);
        });
    });

    it('should not return email for payload having email:true', function() {
      return newToken({ scope: 'profile:email' })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token,
              email: true,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.equal(res.result.email, undefined);
        });
    });
  });

  describe('/destroy', function() {
    it('should destroy access tokens', function() {
      var token;
      return newToken()
        .then(function(res) {
          token = res.result.access_token;
          return Server.api.post({
            url: '/destroy',
            payload: {
              token: token,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.deepEqual(res.result, {});
          return db.getAccessToken(encrypt.hash(token)).then(function(tok) {
            assert.equal(tok, undefined);
          });
        });
    });

    it('should destroy refresh tokens', function() {
      var token;
      return newToken({ access_type: 'offline' })
        .then(function(res) {
          token = res.result.refresh_token;
          return Server.api.post({
            url: '/destroy',
            payload: {
              refresh_token: token,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.deepEqual(res.result, {});
          return db.getRefreshToken(encrypt.hash(token)).then(function(tok) {
            assert.equal(tok, undefined);
          });
        });
    });

    it('should destroy refresh tokens by id', function() {
      var token;
      return newToken({ access_type: 'offline' })
        .then(function(res) {
          token = res.result.refresh_token;
          const refreshTokenId = encrypt.hash(token).toString('hex');
          return Server.api.post({
            url: '/destroy',
            payload: {
              refresh_token_id: refreshTokenId,
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
          assert.deepEqual(res.result, {});
          return db.getRefreshToken(encrypt.hash(token)).then(function(tok) {
            assert.equal(tok, undefined);
          });
        });
    });

    it('should accept client_secret', function() {
      return newToken()
        .then(function(res) {
          return Server.api.post({
            url: '/destroy',
            payload: {
              token: res.result.access_token,
              client_secret: 'foo',
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
        });
    });
    it('should accept empty client_secret', function() {
      return newToken()
        .then(function(res) {
          return Server.api.post({
            url: '/destroy',
            payload: {
              token: res.result.access_token,
              client_secret: '',
            },
          });
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res);
        });
    });
  });

  describe('/jwks', function() {
    it('should not include the private part of the key', function() {
      return Server.api
        .get({
          url: '/jwks',
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res, {
            'cache-control': 'max-age=10, must-revalidate, public',
          });

          var key = res.result.keys[0];
          assert(key.n);
          assert(key.e);
          assert(!key.d);
        });
    });

    it('should include the oldKey if present', function() {
      assert.ok(
        config.get('openid.oldKey'),
        'openid.oldKey should be present by default during tests'
      );
      return Server.api
        .get({
          url: '/jwks',
        })
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          assertSecurityHeaders(res, {
            'cache-control': 'max-age=10, must-revalidate, public',
          });

          var keys = res.result.keys;
          assert.equal(keys.length, 2);
          assert(!keys[1].d);
          assert.notEqual(keys[0].kid, keys[1].kid);
        });
    });
  });

  describe('/client-tokens', function() {
    var BAD_TOKEN =
      '0000000000000000000000000000000000000000000000000000000000000000';
    var tokenWithClientWrite;
    var tokenWithoutClientWrite;
    var user1;
    var user2;
    var client1Id;
    var client2Id;
    var client1;
    var client2;

    beforeEach(function() {
      user1 = {
        uid: unique(16).toString('hex'),
        email: unique(10).toString('hex') + '@token.city',
      };

      user2 = {
        uid: unique(16).toString('hex'),
        email: unique(10).toString('hex') + '@token.city',
      };

      client1Id = unique.id();
      client1 = {
        name: 'test/api/client-tokens/list-b',
        id: client1Id,
        hashedSecret: encrypt.hash(unique.secret()),
        redirectUri: 'https://example.domain',
        imageUri: 'https://example.com/logo.png',
        trusted: true,
      };

      client2Id = unique.id();
      client2 = {
        name: 'test/api/client-tokens/list-a',
        id: client2Id,
        hashedSecret: encrypt.hash(unique.secret()),
        redirectUri: 'https://example.domain',
        imageUri: 'https://example.com/logo.png',
        trusted: false,
      };

      // create a new client
      return db
        .registerClient(client1)
        .then(function() {
          // user1 gets a client write token
          return getUniqueUserAndToken(client1Id.toString('hex'), {
            uid: user1.uid,
            email: user1.email,
            scopes: ['profile', 'clients:write'],
          });
        })
        .then(function(result) {
          tokenWithClientWrite = result.token;
        });
    });

    describe('GET /client-tokens', function() {
      it('should list connected services in set order', function() {
        return db
          .registerClient(client2)
          .then(function() {
            return getUniqueUserAndToken(client2Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['profile'],
            });
          })
          .then(function(result) {
            tokenWithoutClientWrite = result.token;

            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithoutClientWrite,
              },
            });
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(
              result.code,
              403,
              'list does not fetch without a proper token'
            );
            assert.equal(result.error, 'Forbidden');
            assertSecurityHeaders(res);

            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            // The API sorts the results by createdAt and then by name
            // The precision is one second, this test guarantees that if
            // the tokens were created in the same second, they will still be sorted by name.
            var result = res.result;
            assert.equal(result.length, 2);
            assert.equal(result[0].id, client2Id.toString('hex'));
            assert.ok(result[0].lastAccessTime);
            assert.equal(
              result[0].lastAccessTimeFormatted,
              'a few seconds ago'
            );
            assert.equal(result[0].name, 'test/api/client-tokens/list-a');

            assert.equal(result[1].id, client1Id.toString('hex'));
            assert.ok(result[1].lastAccessTime);
            assert.equal(
              result[1].lastAccessTimeFormatted,
              'a few seconds ago'
            );
            assert.equal(result[1].name, 'test/api/client-tokens/list-b');
            assertSecurityHeaders(res);
          });
      });

      it('should not list tokens of different users', function() {
        return db
          .registerClient(client2)
          .then(function() {
            return getUniqueUserAndToken(client2Id.toString('hex'), {
              uid: user2.uid,
              email: user2.email,
              scopes: ['profile'],
            });
          })
          .then(function(res) {
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.length, 1);
            assert.equal(result[0].id, client1Id.toString('hex'));
            assert.equal(
              result[0].lastAccessTimeFormatted,
              'a few seconds ago'
            );
            assert.equal(result[0].name, 'test/api/client-tokens/list-b');
            assertSecurityHeaders(res);
          });
      });

      it('should not list canGrant=1 clients that only have access tokens', function() {
        return db
          .registerClient({
            name: 'test/api/client-tokens/list-can-grant',
            id: client2Id,
            hashedSecret: encrypt.hash(unique.secret()),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.com/logo.png',
            trusted: true,
            canGrant: true,
          })
          .then(function() {
            return getUniqueUserAndToken(client2Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['profile'],
            });
          })
          .then(function(res) {
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.length, 1);
            assert.equal(result[0].id, client1Id.toString('hex'));
            assertSecurityHeaders(res);
          });
      });

      it('should list canGrant=1 clients that have refresh tokens', function() {
        return db
          .registerClient({
            name: 'test/api/client-tokens/aaaa-list-can-grant',
            id: client2Id,
            hashedSecret: encrypt.hash(unique.secret()),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.com/logo.png',
            trusted: true,
            canGrant: true,
          })
          .then(function() {
            return getUniqueUserAndToken(client2Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['profile'],
            });
          })
          .then(function() {
            // also create a refreshToken for user1
            return db.generateRefreshToken({
              clientId: client2Id,
              userId: buf(user1.uid),
              email: user1.email,
              scope: ['scopeFromRefreshToken'],
            });
          })
          .then(function(res) {
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.length, 2);
            assert.equal(result[0].id, client2Id.toString('hex'));
            assert.deepEqual(result[0].scope, ['scopeFromRefreshToken']);
            assert.equal(result[1].id, client1Id.toString('hex'));
            assert.deepEqual(result[1].scope, ['clients:write', 'profile']);
            assertSecurityHeaders(res);
          });
      });

      it('should only list one client for multiple tokens', function() {
        var tok;
        return getUniqueUserAndToken(client1Id.toString('hex'), {
          uid: user1.uid,
          email: user1.email,
          scopes: ['profile', 'profile:write'],
        })
          .then(function() {
            return getUniqueUserAndToken(client1Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['clients:write'],
            });
          })
          .then(function() {
            return getUniqueUserAndToken(client1Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['profile'],
            });
          })
          .then(function(client) {
            return db.getAccessToken(encrypt.hash(client.token));
          })
          .then(function(token) {
            tok = token;
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.length, 1);
            assert.equal(result[0].id, client1Id.toString('hex'));
            assert.equal(
              result[0].lastAccessTime,
              tok.createdAt.getTime(),
              'lastAccessTime should be equal to the latest Token createdAt time'
            );
            assertSecurityHeaders(res);
            assert.deepEqual(result[0].scope, [
              'clients:write',
              'profile:write',
            ]);
          });
      });

      it('should only return union of scopes for multiple tokens', function() {
        return getUniqueUserAndToken(client1Id.toString('hex'), {
          uid: user1.uid,
          email: user1.email,
          scopes: ['profile', 'profile:write'],
        })
          .then(function() {
            return getUniqueUserAndToken(client1Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['clients:write'],
            });
          })
          .then(function() {
            return getUniqueUserAndToken(client1Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['basket', 'profile:email'],
            });
          })
          .then(function() {
            return getUniqueUserAndToken(client1Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: ['profile:uid', 'profile', 'profile:write'],
            });
          })
          .then(function() {
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            var result = res.result;
            assert.deepEqual(result[0].scope, [
              'basket',
              'clients:write',
              'profile:write',
            ]);
          });
      });

      it('errors for invalid tokens', function() {
        return Server.api
          .get({
            url: '/client-tokens',
            headers: {
              authorization: 'Bearer ' + BAD_TOKEN,
            },
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.code, 401);
            assert.equal(result.detail, 'Bearer token invalid');
            assertSecurityHeaders(res);
          });
      });

      it('errors for bad scopes', function() {
        function reqWithScopes(scopes) {
          return getUniqueUserAndToken(client1Id.toString('hex'), {
            uid: user1.uid,
            email: user1.email,
            scopes: scopes,
          }).then(function(result) {
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + result.token,
              },
            });
          });
        }

        return P.all([
          reqWithScopes(['clients']),
          reqWithScopes(['bar:foo:clients:write']),
          reqWithScopes(['clients:write:foo']),
          reqWithScopes(['clients:writ']),
        ]).then(function(result) {
          assert.equal(result[0].statusCode, 403);
          assert.equal(result[1].statusCode, 403);
          assert.equal(result[2].statusCode, 403);
          assert.equal(result[3].statusCode, 403);
          result.forEach(assertSecurityHeaders);
        });
      });

      it('requires auth', function() {
        return Server.api
          .get({
            url: '/client-tokens',
            headers: {},
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.code, 401);
            assert.equal(result.detail, 'Bearer token not provided');
            assertSecurityHeaders(res);
          });
      });
    });

    describe('DELETE /client-tokens/{client_id}', function() {
      it('deletes all tokens and refreshTokens for some client id', function() {
        const scopes = ['profile'];
        let user2ClientWriteToken;
        let refreshTokenIdHash;
        return db
          .registerClient(client2)
          .then(function() {
            return getUniqueUserAndToken(client2Id.toString('hex'), {
              uid: user1.uid,
              email: user1.email,
              scopes: scopes,
            });
          })
          .then(function() {
            return getUniqueUserAndToken(client2Id.toString('hex'), {
              uid: user2.uid,
              email: user2.email,
              scopes: ['profile', 'clients:write'],
            });
          })
          .then(function(res) {
            user2ClientWriteToken = res.token;

            // also create a refreshToken for user1
            return db.generateRefreshToken({
              clientId: client2Id,
              userId: buf(user1.uid),
              email: user1.email,
              scope: scopes,
            });
          })
          .then(function(t) {
            refreshTokenIdHash = encrypt.hash(t.token.toString('hex'));

            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.result.length, 2);
            assertSecurityHeaders(res);

            return db.getRefreshToken(refreshTokenIdHash);
          })
          .then(function(tok) {
            assert.equal(
              tok.token.toString('hex'),
              refreshTokenIdHash.toString('hex'),
              'refresh token was not deleted'
            );

            return Server.api.delete({
              url: '/client-tokens/' + client2Id.toString('hex'),
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.payload, '{}');

            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.result.length, 1);
            assertSecurityHeaders(res);

            return Server.api.delete({
              url: '/client-tokens/' + client1Id.toString('hex'),
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function() {
            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(function(res) {
            assert.equal(
              res.result.code,
              401,
              'client:write token was deleted'
            );
            assert.equal(res.result.detail, 'Bearer token invalid');
            assertSecurityHeaders(res);

            return db.getRefreshToken(refreshTokenIdHash);
          })
          .then(function(tok) {
            assert.equal(tok, undefined, 'refresh token was deleted');

            return Server.api.get({
              url: '/client-tokens',
              headers: {
                authorization: 'Bearer ' + user2ClientWriteToken,
              },
            });
          })
          .then(function(res) {
            assert.equal(res.statusCode, 200, 'user2 tokens not deleted');
            assertSecurityHeaders(res);
            assert.equal(res.result.length, 1);
          });
      });

      it('deletes outstanding authorization codes for the client', () => {
        let code;
        mockAssertion().reply(200, mockVerifierResult({ uid: user1.uid }));
        return Server.api
          .post({
            url: '/authorization',
            payload: authParams({
              scope: 'profile',
            }),
          })
          .then(res => {
            code = res.result.code;
            assert.ok(code, 'an authorization code was generated');
            return Server.api.delete({
              url: '/client-tokens/' + clientId.toString('hex'),
              headers: {
                authorization: 'Bearer ' + tokenWithClientWrite,
              },
            });
          })
          .then(res => {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code,
              },
            });
          })
          .then(res => {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.code, 400);
            assert.equal(res.result.errno, 105);
            assert.equal(res.result.message, 'Unknown code');
            assertSecurityHeaders(res);
          });
      });

      it('errors for invalid tokens', function() {
        return Server.api
          .delete({
            url: '/client-tokens/' + clientId,
            headers: {
              authorization: 'Bearer ' + BAD_TOKEN,
            },
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.code, 401);
            assert.equal(result.detail, 'Bearer token invalid');
            assertSecurityHeaders(res);
          });
      });

      it('requires auth', function() {
        return Server.api
          .delete({
            url: '/client-tokens/' + clientId,
            headers: {},
          })
          .then(function(res) {
            var result = res.result;
            assert.equal(result.code, 401);
            assert.equal(result.detail, 'Bearer token not provided');
            assertSecurityHeaders(res);
          });
      });

      it('errors for bad scopes', function() {
        function reqWithScopes(scopes) {
          return getUniqueUserAndToken(clientId, {
            scopes: scopes,
          }).then(function(result) {
            return Server.api.delete({
              url: '/client-tokens/' + clientId,
              headers: {
                authorization: 'Bearer ' + result.token,
              },
            });
          });
        }

        return P.all([
          reqWithScopes(['clients']),
          reqWithScopes(['bar:foo:clients:write']),
          reqWithScopes(['clients:write:foo']),
          reqWithScopes(['clients:writ']),
        ]).then(function(result) {
          assert.equal(result[0].statusCode, 403);
          assert.equal(result[1].statusCode, 403);
          assert.equal(result[2].statusCode, 403);
          assert.equal(result[3].statusCode, 403);
          result.forEach(assertSecurityHeaders);
        });
      });
    });
  });

  describe('/authorized-clients', () => {
    let user1, user2, client1Id, client2Id, client1, client2;

    function withMockAssertion(user, params) {
      mockAssertion().reply(
        200,
        mockVerifierResult({
          uid: user.uid,
          vemail: user.email,
        })
      );
      return {
        assertion: AN_ASSERTION,
        ...params,
      };
    }

    async function makeAccessToken(client, user, scope) {
      const token = await db.generateAccessToken({
        clientId: client.id,
        userId: buf(user.uid),
        email: user.email,
        scope: ScopeSet.fromArray(scope),
      });
      return encrypt.hash(token.token).toString('hex');
    }

    async function makeRefreshToken(client, user, scope) {
      const token = await db.generateRefreshToken({
        clientId: client.id,
        userId: buf(user.uid),
        email: user.email,
        scope: ScopeSet.fromArray(scope),
      });
      return encrypt.hash(token.token).toString('hex');
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
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);
        const clients = res.result;
        assert.equal(clients.length, 2);
        // The API sorts the results by last-used time and then by name.
        // Since we create the token for client2 after that of client1,
        // either way we'll end up with client2 at the start of the list.
        assert.equal(clients[0].client_id, client2Id.toString('hex'));
        assert.ok(clients[0].created_time);
        assert.ok(clients[0].last_access_time);
        assert.equal(
          clients[0].client_name,
          'test/api/authorized-clients/aaa-two'
        );
        assert.deepEqual(clients[0].scope, ['aa_scope', 'bb_scope']);

        assert.equal(clients[1].client_id, client1Id.toString('hex'));
        assert.ok(clients[1].created_time);
        assert.ok(clients[1].last_access_time);
        assert.equal(
          clients[1].client_name,
          'test/api/authorized-clients/bbb-one'
        );
        assert.deepEqual(clients[1].scope, ['profile']);
      });

      it('should not list tokens of different users', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user2, ['bb_scope', 'aa_scope']);

        const res1 = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res1.statusCode, 200);
        assertSecurityHeaders(res1);
        const clients1 = res1.result;
        assert.equal(clients1.length, 1);
        assert.equal(clients1[0].client_id, client1Id.toString('hex'));

        const res2 = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user2, {}),
        });
        assert.equal(res2.statusCode, 200);
        assertSecurityHeaders(res2);
        const clients2 = res2.result;
        assert.equal(clients2.length, 1);
        assert.equal(clients2[0].client_id, client2Id.toString('hex'));
      });

      it('should seperately list different refresh tokens from the same client', async () => {
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
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);
        const clients = res.result;
        assert.equal(clients.length, 3);
        assert.equal(clients[0].client_id, client2Id.toString('hex'));
        assert.deepEqual(clients[0].scope, [
          'aaaSortMeFirst',
          'other',
          'scope',
        ]);
        assert.ok(clients[0].refresh_token_id);
        assert.equal(clients[1].client_id, client2Id.toString('hex'));
        assert.deepEqual(clients[1].scope, ['profile']);
        assert.ok(clients[1].refresh_token_id);
        assert.equal(clients[2].client_id, client1Id.toString('hex'));
        assert.deepEqual(clients[2].scope, ['other', 'profile', 'scope']);
        assert.ok(!clients[2].refresh_token_id);
      });

      it('should not list canGrant=1 clients that only have access tokens', async () => {
        await db.updateClient({
          ...client2,
          canGrant: true,
        });
        await makeAccessToken(client1, user1, ['profile']);
        await makeAccessToken(client2, user1, ['profile']);
        const res = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);
        const clients = res.result;
        assert.equal(clients.length, 1);
        assert.equal(clients[0].client_id, client1Id.toString('hex'));
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
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);
        const clients = res.result;
        assert.equal(clients.length, 2);
        assert.equal(clients[0].client_id, client2Id.toString('hex'));
        assert.equal(clients[1].client_id, client1Id.toString('hex'));
      });

      it('requires a valid assertion', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        mockAssertion().reply(400, VERIFY_FAILURE);

        let res = await Server.api.post({
          url: '/authorized-clients',
          payload: {
            assertion: AN_ASSERTION,
          },
        });
        assert.equal(res.statusCode, 401);
        assert.equal(res.result.message, 'Invalid assertion');
        assertSecurityHeaders(res);

        // Check that it didn't delete the token.
        res = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);
        const clients = res.result;
        assert.equal(clients.length, 1);
        assert.equal(clients[0].client_id, client1Id.toString('hex'));
      });
    });

    describe('POST /authorized-clients/destroy', function() {
      it('can delete all tokens a target client id', async () => {
        await makeAccessToken(client1, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);
        await makeRefreshToken(client2, user1, ['profile']);

        let res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: withMockAssertion(user1, {
            client_id: client1Id.toString('hex'),
          }),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);

        res = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.length, 2);
        assert.equal(res.result[0].client_id, client2Id.toString('hex'));

        res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: withMockAssertion(user1, {
            client_id: client2Id.toString('hex'),
          }),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);

        res = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.length, 0);
      });

      it('deletes outstanding authorization codes for the client', async () => {
        mockAssertion().reply(200, mockVerifierResult({ uid: user1.uid }));
        let res = await Server.api.post({
          url: '/authorization',
          payload: authParams({
            scope: 'profile',
          }),
        });
        const code = res.result.code;
        assert.ok(code, 'an authorization code was generated');
        await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: withMockAssertion(user1, {
            client_id: clientId,
          }),
        });
        assert.equal(res.statusCode, 200);
        res = await Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            client_secret: secret,
            code,
          },
        });
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.code, 400);
        assert.equal(res.result.errno, 105);
        assert.equal(res.result.message, 'Unknown code');
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
          payload: withMockAssertion(user1, {
            client_id: client2Id.toString('hex'),
            refresh_token_id: tokenId,
          }),
        });
        assert.equal(res.statusCode, 200);
        assertSecurityHeaders(res);

        res = await Server.api.post({
          url: '/authorized-clients',
          payload: withMockAssertion(user1, {}),
        });
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.length, 2);
        assert.equal(res.result[0].client_id, client2Id.toString('hex'));
        assert.deepEqual(res.result[0].scope, ['profile']);
        assert.notEqual(res.result[0].refresh_token_id, tokenId);
        assert.equal(res.result[1].client_id, client1Id.toString('hex'));
        assert.deepEqual(res.result[1].scope, ['profile']);
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
          payload: withMockAssertion(user1, {
            client_id: client1Id.toString('hex'),
            refresh_token_id: tokenId,
          }),
        });
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.errno, 122);
        assert.equal(res.result.message, 'Unknown token');
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
          payload: withMockAssertion(user2, {
            client_id: client2Id.toString('hex'),
            refresh_token_id: tokenId,
          }),
        });
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.errno, 122);
        assert.equal(res.result.message, 'Unknown token');
        assertSecurityHeaders(res);
      });

      it('requires a valid assertion', async () => {
        mockAssertion().reply(400, VERIFY_FAILURE);
        const res = await Server.api.post({
          url: '/authorized-clients/destroy',
          payload: {
            assertion: AN_ASSERTION,
            client_id: client1Id.toString('hex'),
          },
        });
        assert.equal(res.statusCode, 401);
        assert.equal(res.result.message, 'Invalid assertion');
        assertSecurityHeaders(res);
      });
    });
  });

  describe('/introspect', () => {
    let accessToken;

    before(async () => {
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
      assert.strictEqual(res.statusCode, 200);
      assert.isFalse(res.result.active);
    });

    it('should succeed if token is an access token', async () => {
      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: accessToken,
        },
      });
      assert.strictEqual(res.statusCode, 200);
      const { result } = res;
      assert.isTrue(result.active);
      assert.strictEqual(result.scope, 'a');
      assert.strictEqual(result.client_id, 'dcdb5ae7add825d2');
      assert.strictEqual(result.token_type, 'access_token');
      assert.isNumber(result.exp);
      assert.isAbove(result.exp, Date.now());
      assert.isNumber(result.iat);
      assert.isBelow(result.iat, Date.now());
      assert.strictEqual(result.sub, USERID);
      assert.isUndefined(result['fxa-lastUsedAt']);
    });

    it('should return { active: false } if token is an access token, but token_type_hint=refresh_token', async () => {
      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: accessToken,
          token_type_hint: 'refresh_token',
        },
      });
      assert.strictEqual(res.statusCode, 200);
      assert.isFalse(res.result.active);
    });

    it('should return a `not a public client` error if not a public client and using a refresh token', async () => {
      const tokenRes = await newToken({
        access_type: 'offline',
      });

      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenRes.result.refresh_token,
        },
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.result.errno, 116);
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

      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenRes.result.refresh_token,
        },
      });

      assert.strictEqual(res.statusCode, 200);
      const { result } = res;

      assert.isTrue(result.active);
      assert.strictEqual(result.scope, 'a');
      assert.strictEqual(result.client_id, '38a6b9b3a65a1872');
      assert.strictEqual(result.token_type, 'refresh_token');
      assert.isUndefined(result.exp);
      assert.isNumber(result.iat);
      assert.isBelow(result.iat, Date.now());
      assert.strictEqual(result.sub, USERID);
      assert.isNumber(result['fxa-lastUsedAt']);
      assert.isBelow(result['fxa-lastUsedAt'], Date.now());
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

      const res = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenRes.result.refresh_token,
          token_type_hint: 'access_token',
        },
      });

      assert.strictEqual(res.statusCode, 200);
      const { result } = res;

      assert.isFalse(result.active);
    });
  });

  describe('JWT access token', () => {
    it('succeeds', async () => {
      const jwtClient = clientByName('JWT Client');
      assert(jwtClient.canGrant); //sanity check
      const clientId = jwtClient.id;
      mockAssertion().reply(200, VERIFY_GOOD);

      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: clientId,
          resource: 'https://resource.server.com/?query=1',
        }
      );

      assert.equal(tokenResult.statusCode, 200);
      assertSecurityHeaders(tokenResult);
      assert.ok(tokenResult.result.access_token);
      assert.isNull(
        validators.jwt.validate(tokenResult.result.access_token).error
      );
      assert.strictEqual(tokenResult.result.token_type, 'bearer');
      assert.ok(tokenResult.result.auth_at);
      assert.ok(tokenResult.result.expires_in);
      assert.strictEqual(tokenResult.result.scope, 'a');
      assert.isUndefined(tokenResult.result.keys_jwe);
      assert.ok(tokenResult.result.refresh_token);

      const tokenResultJWT = decodeJWT(tokenResult.result.access_token);
      assert.deepEqual(tokenResultJWT.claims.aud, [
        clientId,
        'https://resource.server.com/?query=1',
      ]);
      assert.strictEqual(tokenResultJWT.claims.client_id, clientId);
      assert.ok(tokenResultJWT.claims.exp);
      assert.ok(tokenResultJWT.claims.iat);
      assert.ok(tokenResultJWT.claims.jti);
      assert.strictEqual(tokenResultJWT.claims.scope, 'a');
      assert.strictEqual(tokenResultJWT.claims.sub, USERID);

      const verifyResult = await Server.api.post({
        url: '/verify',
        payload: {
          token: tokenResult.result.access_token,
        },
      });

      assert.equal(verifyResult.statusCode, 200);

      const introspectResult = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenResult.result.access_token,
          token_type_hint: 'access_token',
        },
      });

      assert.equal(introspectResult.statusCode, 200);
      assert.isTrue(introspectResult.result.active);

      const destroyResult = await Server.api.post({
        url: '/destroy',
        payload: {
          token: tokenResult.result.access_token,
        },
      });

      assert.equal(destroyResult.statusCode, 200);

      const verifyInvalidTokenResult = await Server.api.post({
        url: '/verify',
        payload: {
          token: tokenResult.result.access_token,
        },
      });

      assert.equal(verifyInvalidTokenResult.statusCode, 400);
      assert.equal(verifyInvalidTokenResult.result.errno, 108);

      const introspectInvalidTokenResult = await Server.api.post({
        url: '/introspect',
        payload: {
          token: tokenResult.result.access_token,
          token_type_hint: 'access_token',
        },
      });

      assert.equal(introspectInvalidTokenResult.statusCode, 200);
      assert.isFalse(introspectInvalidTokenResult.result.active);

      const refreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: clientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: tokenResult.result.refresh_token,
          resource: 'https://resource.server2.com',
          scope: 'a',
        },
      });

      assert.equal(refreshTokenResult.statusCode, 200);
      assertSecurityHeaders(refreshTokenResult);
      assert.ok(refreshTokenResult.result.access_token);
      assert.isNull(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      );
      assert.strictEqual(refreshTokenResult.result.token_type, 'bearer');
      assert.ok(refreshTokenResult.result.expires_in);
      assert.equal(refreshTokenResult.result.scope, 'a');
      assert.isUndefined(refreshTokenResult.result.keys_jwe);
      assert.isUndefined(refreshTokenResult.result.refresh_token);

      const refreshTokenResultJWT = decodeJWT(
        refreshTokenResult.result.access_token
      );
      assert.deepEqual(refreshTokenResultJWT.claims.aud, [
        clientId,
        'https://resource.server2.com',
      ]);
      assert.strictEqual(refreshTokenResultJWT.claims.client_id, clientId);
      assert.ok(refreshTokenResultJWT.claims.exp);
      assert.ok(refreshTokenResultJWT.claims.iat);
      assert.ok(refreshTokenResultJWT.claims.jti);
      assert.strictEqual(refreshTokenResultJWT.claims.scope, 'a');
      // No ppid or rotation.
      assert.strictEqual(refreshTokenResultJWT.claims.sub, USERID);

      const noResourceRefreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: clientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: tokenResult.result.refresh_token,
          scope: 'a',
        },
      });
      assert.equal(noResourceRefreshTokenResult.statusCode, 200);
      const noResourceRefreshTokenResultJWT = decodeJWT(
        noResourceRefreshTokenResult.result.access_token
      );
      // If only the client_id is returned, return a string rather than an array.
      assert.strictEqual(noResourceRefreshTokenResultJWT.claims.aud, clientId);
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
      mockAssertion().reply(200, VERIFY_GOOD);
      const ppidTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: ppidClientId,
        }
      );

      assert.equal(ppidTokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(ppidTokenResult.result.access_token).error
      );

      const ppidJWT = decodeJWT(ppidTokenResult.result.access_token);
      assert.notEqual(ppidJWT.claims.sub, USERID);
      assert.lengthOf(ppidJWT.claims.sub, USERID.length);
    });

    it('does not automatically rotate unless enabled for client', async () => {
      mockAssertion().reply(200, VERIFY_GOOD);
      const initialTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: ppidClientId,
        }
      );
      assert.equal(initialTokenResult.statusCode, 200);
      const initialJWT = decodeJWT(initialTokenResult.result.access_token);
      assert.notEqual(initialJWT.claims.sub, USERID);
      assert.lengthOf(initialJWT.claims.sub, USERID.length);

      // delay long enough to force a rotation if enabled for client
      await P.delay(200);

      const refreshTokenResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: ppidClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: initialTokenResult.result.refresh_token,
        },
      });

      assert.equal(refreshTokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      );

      const refreshTokenJWT = decodeJWT(refreshTokenResult.result.access_token);

      assert.strictEqual(initialJWT.claims.sub, refreshTokenJWT.claims.sub);
    });

    it('ignores ppid_seed unless PPID is enabled for client', async () => {
      mockAssertion().reply(200, VERIFY_GOOD);
      const seededTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: noPpidClientId,
          ppidSeed: 100,
        }
      );
      assert.equal(seededTokenResult.statusCode, 200);
      const seededJWT = decodeJWT(seededTokenResult.result.access_token);
      assert.ok(seededTokenResult.result.refresh_token);

      assert.strictEqual(seededJWT.claims.sub, USERID);

      // delay long enough to force a rotation if enabled for client
      await P.delay(200);

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

      assert.equal(refreshTokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      );

      const refreshTokenJWT = decodeJWT(refreshTokenResult.result.access_token);

      assert.strictEqual(refreshTokenJWT.claims.sub, USERID);
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
      mockAssertion().reply(200, VERIFY_GOOD);

      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
        }
      );
      assert.equal(tokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(tokenResult.result.access_token).error
      );
      const tokenJWT = decodeJWT(tokenResult.result.access_token);
      assert.notEqual(tokenJWT.claims.sub, USERID);
      assert.lengthOf(tokenJWT.claims.sub, USERID.length);

      // delay long enough to force a server side rotation if enabled for client
      await P.delay(200);

      const serverRotatedResult = await Server.api.post({
        url: '/token',
        payload: {
          client_id: rotatingSubClientId,
          client_secret: secret,
          grant_type: 'refresh_token',
          refresh_token: tokenResult.result.refresh_token,
        },
      });

      assert.equal(serverRotatedResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(serverRotatedResult.result.access_token).error
      );

      const serverRotatedJWT = decodeJWT(
        serverRotatedResult.result.access_token
      );
      assert.notEqual(serverRotatedJWT.claims.sub, tokenJWT.claims.sub);
      assert.notEqual(serverRotatedJWT.claims.sub, USERID);
      assert.lengthOf(serverRotatedJWT.claims.sub, USERID.length);
    });

    it('accepts ppid_seed when fetching tokens', async () => {
      mockAssertion().reply(200, VERIFY_GOOD);

      const accessTokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
          ppidSeed: 100,
        }
      );
      assert.equal(accessTokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(accessTokenResult.result.access_token).error
      );
      const accessTokenJWT = decodeJWT(accessTokenResult.result.access_token);
      assert.ok(accessTokenJWT.claims.sub);

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
      assert.equal(refreshTokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(refreshTokenResult.result.access_token).error
      );
      const refreshTokenJWT = decodeJWT(refreshTokenResult.result.access_token);
      assert.ok(refreshTokenJWT.claims.sub);

      // The `sub` claims are not compared to each other because on slow CI VMs,
      // the server often forces a time-based rotation.
    });

    it('accepts different ppid_seed when using a refresh_token', async () => {
      mockAssertion().reply(200, VERIFY_GOOD);

      const tokenResult = await newToken(
        {
          access_type: 'offline',
        },
        {
          clientId: rotatingSubClientId,
          ppidSeed: 100,
        }
      );
      assert.equal(tokenResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(tokenResult.result.access_token).error
      );
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
      assert.equal(clientRotatedResult.statusCode, 200);
      assert.isNull(
        validators.jwt.validate(clientRotatedResult.result.access_token).error
      );
      const clientRotatedJWT = decodeJWT(
        clientRotatedResult.result.access_token
      );

      assert.notEqual(clientRotatedJWT.claims.sub, tokenJWT.claims.sub);
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
      assert.equal(tokenResult.statusCode, 400);
      assert.equal(tokenResult.result.errno, 109);
    });
  });

  describe('BrowserID assertions', () => {
    it('cannot be used to access endpoints that accept JWT access tokens', async () => {
      const verifyWithAssertion = await Server.api.post({
        url: '/verify',
        payload: {
          token: AN_ASSERTION,
        },
      });

      assert.equal(verifyWithAssertion.statusCode, 400);
      assert.equal(verifyWithAssertion.result.errno, 109);

      const introspectWithAssertion = await Server.api.post({
        url: '/introspect',
        payload: {
          token: AN_ASSERTION,
          token_type_hint: 'access_token',
        },
      });

      assert.strictEqual(introspectWithAssertion.statusCode, 200);
      assert.isFalse(introspectWithAssertion.result.active);

      const destroyWithAnAssertion = await Server.api.post({
        url: '/destroy',
        payload: {
          token: AN_ASSERTION,
        },
      });

      assert.equal(destroyWithAnAssertion.statusCode, 400);
      assert.equal(destroyWithAnAssertion.result.errno, 109);
    });
  });
});
