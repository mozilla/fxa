/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');
const assert = require('insist');
const nock = require('nock');
const buf = require('buf').hex;
const generateRSAKeypair = require('generate-rsa-keypair');
const JWTool = require('fxa-jwtool');

const auth = require('../lib/auth');
const config = require('../lib/config');
const db = require('../lib/db');
const encrypt = require('../lib/encrypt');
const P = require('../lib/promise');
const Server = require('./lib/server');
const unique = require('../lib/unique');

const USERID = unique(16).toString('hex');
const VEMAIL = unique(4).toString('hex') + '@mozilla.com';
const VERIFY_GOOD = JSON.stringify({
  status: 'okay',
  email: USERID + '@' + config.get('browserid.issuer'),
  issuer: config.get('browserid.issuer'),
  idpClaims: {
    'fxa-verifiedEmail': VEMAIL,
    'fxa-lastAuthAt': 123456
  }
});

const MAX_TTL_S = config.get('expiration.accessToken') / 1000;

function mockAssertion() {
  var parts = url.parse(config.get('browserid.verificationUrl'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path);
}

function genAssertion(email) {
  var idp = JWTool.JWK.fromPEM(
    generateRSAKeypair().private,
    { iss: config.get('browserid.issuer') });
  var userPair = generateRSAKeypair();
  var userSecret = JWTool.JWK.fromPEM(
    userPair.private,
    { iss: config.get('browserid.issuer') });
  var userPublic = JWTool.JWK.fromPEM(userPair.public);
  var now = Date.now();
  var cert = idp.signSync(
    {
      'public-key': userPublic,
      principal: {
        email: email
      },
      iat: now - 1000,
      exp: now,
      'fxa-verifiedEmail': VEMAIL
    }
  );
  var assertion = userSecret.signSync(
    {
      aud: 'oauth.fxa',
      exp: now
    }
  );

  return P.resolve(cert + '~' + assertion);
}


var client;
// this matches the hashed secret in config, an assert sanity checks
// lower to make sure it matches
var secret = 'b93ef8a8f3e553a430d7e5b904c6132b2722633af9f03128029201d24a97f2a8';
var badSecret;
var clientId;
var AN_ASSERTION;

function authParams(params) {
  var defaults = {
    assertion: AN_ASSERTION,
    client_id: clientId,
    state: '1',
    scope: 'a'
  };

  params = params || {};
  Object.keys(params).forEach(function(key) {
    defaults[key] = params[key];
  });
  return defaults;
}

function newToken(payload) {
  payload = payload || {};
  var ttl = payload.ttl || MAX_TTL_S;
  delete payload.ttl;
  mockAssertion().reply(200, VERIFY_GOOD);
  return Server.api.post({
    url: '/authorization',
    payload: authParams(payload)
  }).then(function(res) {
    assert.equal(res.statusCode, 200);
    return Server.api.post({
      url: '/token',
      payload: {
        client_id: clientId,
        client_secret: secret,
        code: url.parse(res.result.redirect, true).query.code,
        ttl: ttl
      }
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
 */
function getUniqueUserAndToken(cId) {
  if (! cId) {
    throw new Error('No client id set');
  }

  var uid = unique(16).toString('hex');
  var email = unique(4).toString('hex') + '@mozilla.com';

  return db.generateAccessToken({
    clientId: buf(cId),
    userId: buf(uid),
    email: email,
    scope: [auth.SCOPE_CLIENT_MANAGEMENT]
  }).then(function (token) {
    return {
      uid: uid,
      email: email,
      token: token.token.toString('hex')
    };
  });
}

function clientByName(name) {
  return config.get('clients').reduce(function (client, lastClient) {
    return client.name === name ? client : lastClient;
  });
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
        badSecret = Buffer(secret, 'hex').slice();
        badSecret[badSecret.length - 1] ^= 1;
        badSecret = badSecret.toString('hex');
      })
    ]).done(function() { done(); }, done);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('/authorization', function() {

    describe('GET', function() {
      it('redirects with all query params', function(done) {
        Server.api
        .get('/authorization?client_id=123&state=321&scope=1&action=signup&a=b')
        .then(function(res) {
          assert.equal(res.statusCode, 302);
          var redirect = url.parse(res.headers.location, true);

          assert.equal(redirect.query.client_id, '123');
          assert.equal(redirect.query.state, '321');
          assert.equal(redirect.query.scope, '1');
          // unknown query params are forwarded
          assert.equal(redirect.query.a, 'b');
          var target = url.parse(config.get('contentUrl'), true);
          assert.equal(redirect.pathname, target.pathname + 'signup');
          assert.equal(redirect.host, target.host);
        }).done(done, done);
      });

      it('redirects `action=signin` to signin', function(done) {
        Server.api
        .get('/authorization?client_id=123&state=321&scope=1&action=signin&a=b')
        .then(function(res) {
          assert.equal(res.statusCode, 302);
          var redirect = url.parse(res.headers.location, true);

          assert.equal(redirect.query.client_id, '123');
          assert.equal(redirect.query.state, '321');
          assert.equal(redirect.query.scope, '1');
          // unknown query params are forwarded
          assert.equal(redirect.query.a, 'b');
          var target = url.parse(config.get('contentUrl'), true);
          assert.equal(redirect.pathname, target.pathname + 'signin');
          assert.equal(redirect.host, target.host);
        }).done(done, done);
      });

      it('redirects no action to contentUrl root', function(done) {
        Server.api.get('/authorization?client_id=123&state=321&scope=1')
        .then(function(res) {
          assert.equal(res.statusCode, 302);
          var redirect = url.parse(res.headers.location, true);

          var target = url.parse(config.get('contentUrl'), true);
          assert.equal(redirect.pathname, target.pathname);
          assert.equal(redirect.host, target.host);
        }).done(done, done);
      });

      it('redirects `action=force_auth` to force_auth', function(done) {
        var endpoint = '/authorization?action=force_auth&email=' +
          encodeURIComponent(VEMAIL);
        Server.api.get(endpoint)
        .then(function(res) {
          assert.equal(res.statusCode, 302);
          var redirect = url.parse(res.headers.location, true);

          var target = url.parse(config.get('contentUrl'), true);
          assert.equal(redirect.pathname, target.pathname + 'force_auth');
          assert.equal(redirect.host, target.host);
          assert.equal(redirect.query.email, VEMAIL);
        }).done(done, done);
      });

      it('should fail for invalid action', function(done) {
        Server.api
        .get('/authorization?client_id=123&state=321&scope=1&action=something_invalid&a=b')
        .then(function(res) {
          assert.equal(res.statusCode, 400);
          assert.equal(res.result.errno, 109);
          assert.equal(res.result.validation, 'action');
        }).done(done, done);
      });
    });

    describe('content-type', function() {
      it('should fail if unsupported', function() {
        return Server.api.post({
          url: '/authorization',
          headers: {
            'content-type': 'text/plain'
          },
          payload: authParams()
        }).then(function(res) {
          assert.equal(res.statusCode, 415);
          assert.equal(res.result.errno, 113);
        });
      });
    });

    describe('untrusted client scope', function() {
      it('should fail if invalid scopes', function() {
        var client = clientByName('Untrusted');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post({
          url: '/authorization',
          payload: authParams({
            client_id: client.id,
            scope: 'profile profile:write profile:uid'
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 400);
          assert.equal(res.result.errno, 114);
          assert.ok(res.result.invalidScopes.indexOf('profile') !== -1);
          assert.ok(res.result.invalidScopes.indexOf('profile:write') !== -1);
          assert.ok(res.result.invalidScopes.indexOf('profile:uid') === -1);
        });
      });

      it('should succeed if valid scope', function() {
        var client = clientByName('Untrusted');
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post({
          url: '/authorization',
          payload: authParams({
            client_id: client.id,
            scope: 'profile:email profile:uid'
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
        });
      });
    });

    describe('?client_id', function() {

      it('is required', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            client_id: undefined
          })
        }).then(function(res) {
          assertInvalidRequestParam(res.result, 'client_id');
        }).done(done, done);
      });

    });

    describe('?assertion', function() {

      it('is required', function(done) {
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            assertion: undefined
          })
        }).then(function(res) {
          assertInvalidRequestParam(res.result, 'assertion');
        }).done(done, done);
      });

      it('errors correctly if invalid', function(done) {
        mockAssertion().reply(400, '{"status":"failure"}');
        Server.api.post({
          url: '/authorization',
          payload: authParams()
        }).then(function(res) {
          assert.equal(res.result.code, 401);
          assert.equal(res.result.message, 'Invalid assertion');
        }).done(done, done);
      });

    });

    describe('?redirect_uri', function() {
      it('is optional', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            redirect_uri: client.redirectUri
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert(res.result.redirect);
        }).done(done, done);
      });

      it('must be same as registered redirect', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post({
          url: '/authorization',
          payload: authParams({
            redirect_uri: 'http://localhost:8080/derp'
          })
        }).then(function(res) {
          assert.equal(res.result.code, 400);
          assert.equal(res.result.message, 'Incorrect redirect_uri');
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
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: 'http://bad.uri/derp'
            })
          }).then(function(res) {
            assert.equal(res.result.code, 400);
            assert.equal(res.result.message, 'Incorrect redirect_uri');
          });
        });

        it('can be localhost with config set', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: 'http://localhost:8080/derp'
            })
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert(res.result.redirect);
          });
        });

        it('can be 127.0.0.1 with config set', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              redirect_uri: 'http://127.0.0.1:8080/derp'
            })
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert(res.result.redirect);
          });
        });

      });

      it('can be a URN', function() {
        mockAssertion().reply(200, VERIFY_GOOD);
        return Server.api.post({
          url: '/authorization',
          payload: authParams({
            client_id: '98e6508e88680e1b'
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          var expected = 'urn:ietf:wg:oauth:2.0:fx:webchannel';
          var actual = res.result.redirect.substr(0, expected.length);
          assert.equal(actual, expected);
        });
      });
    });

    describe('?state', function() {
      it('is required', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            state: undefined
          })
        }).then(function(res) {
          assertInvalidRequestParam(res.result, 'state');
        }).done(done, done);
      });
      it('is returned', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            state: 'aa'
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(url.parse(res.result.redirect, true).query.state, 'aa');
        }).done(done, done);
      });
    });

    describe('?scope', function() {
      it('is optional', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            scope: undefined
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert(res.result.redirect);
        }).done(done, done);
      });
    });

    describe('?response_type', function() {
      it('is optional', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            response_type: undefined
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert(res.result.redirect);
        }).done(done, done);
      });
      it('can be code', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            response_type: 'code'
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert(res.result.redirect);
        }).done(done, done);
      });
      it('must not be something besides code or token', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            response_type: 'foo'
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 400);
        }).done(done, done);
      });
      it('fails if ttl is specified with code', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            response_type: 'code',
            ttl: 42
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 400);
        }).done(done, done);
      });

      describe('token', function() {
        var client2 = clientByName('Admin');
        assert(client2.canGrant); //sanity check

        it('does not require state argument', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: client2.id,
              state: undefined,
              response_type: 'token'
            })
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
          });
        });

        it('does not require scope argument', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: client2.id,
              scope: undefined,
              response_type: 'token'
            })
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
          });
        });

        it('requires a client with proper permission', function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: client.id,
              response_type: 'token'
            })
          }).then(function(res) {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.errno, 110);
          });
        });
        it('returns an implicit token', function(done) {
          mockAssertion().reply(200, VERIFY_GOOD);
          Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: client2.id,
              response_type: 'token'
            })
          }).then(function(res) {
            var defaultExpiresIn = config.get('expiration.accessToken') / 1000;
            assert.equal(res.statusCode, 200);
            assert(res.result.access_token);
            assert.equal(res.result.token_type, 'bearer');
            assert(res.result.scope);
            assert(res.result.expires_in <= defaultExpiresIn);
            assert(res.result.expires_in > defaultExpiresIn - 10);
            assert(res.result.auth_at);
          }).done(done, done);
        });
        it('honours the ttl parameter', function(done) {
          var ttl = 42;
          mockAssertion().reply(200, VERIFY_GOOD);
          Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: client2.id,
              response_type: 'token',
              ttl: ttl
            })
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert(res.result.expires_in <= ttl);
            assert(res.result.expires_in > ttl - 10);
          }).done(done, done);
        });
      });
    });

    describe('response', function() {
      describe('with a trusted client', function() {
        it('should redirect to the redirect_uri', function(done) {
          mockAssertion().reply(200, VERIFY_GOOD);
          Server.api.post({
            url: '/authorization',
            payload: authParams()
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            var loc = url.parse(res.result.redirect, true);
            var expected = url.parse(client.redirectUri, true);
            assert.equal(loc.protocol, expected.protocol);
            assert.equal(loc.host, expected.host);
            assert.equal(loc.pathname, expected.pathname);
            assert.equal(loc.query.foo, expected.query.foo);
            assert(loc.query.code);
          }).done(done, done);
        });
      });
    });

  });

  describe('/token', function() {

    it('disallows GET', function(done) {
      Server.api.get('/token').then(function(res) {
        assert.equal(res.statusCode, 404);
      }).done(done, done);
    });

    describe('?client_id', function() {
      it('is required', function(done) {
        Server.api.post({
          url: '/token',
          payload: {
            client_secret: secret,
            code: unique.code().toString('hex')
          }
        }).then(function(res) {
          assertInvalidRequestParam(res.result, 'client_id');
        }).done(done, done);
      });
    });

    describe('?client_secret', function() {
      it('is required', function(done) {
        Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            code: unique.code().toString('hex')
          }
        }).then(function(res) {
          assertInvalidRequestParam(res.result, 'client_secret');
        }).done(done, done);
      });

      it('must match server-stored secret', function(done) {
        Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            client_secret: badSecret,
            code: unique.code().toString('hex')
          }
        }).then(function(res) {
          assert.equal(res.statusCode, 400);
          assert.equal(res.result.message, 'Incorrect secret');
        }).done(done, done);
      });
    });

    describe('?grant_type=authorization_code', function() {
      describe('?code', function() {
        it('is required', function(done) {
          Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: secret
            }
          }).then(function(res) {
            assertInvalidRequestParam(res.result, 'code');
          }).done(done, done);
        });

        it('must match an existing code', function(done) {
          Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: secret,
              code: unique.code().toString('hex')
            }
          }).then(function(res) {
            assert.equal(res.result.code, 400);
            assert.equal(res.result.message, 'Unknown code');
          }).done(done, done);
        });

        it('must be a code owned by this client', function(done) {
          var secret2 = unique.secret();
          var client2 = {
            name: 'client2',
            hashedSecret: encrypt.hash(secret2),
            redirectUri: 'https://example.domain',
            imageUri: 'https://example.foo.domain/logo.png',
            trusted: true
          };
          db.registerClient(client2).then(function() {
            mockAssertion().reply(200, VERIFY_GOOD);
            return Server.api.post({
              url: '/authorization',
              payload: authParams({
                client_id: client2.id.toString('hex')
              })
            }).then(function(res) {
              assert.equal(res.statusCode, 200);
              return url.parse(res.result.redirect, true).query.code;
            });
          }).then(function(code) {
            return Server.api.post({
              url: '/token',
              payload: {
                // client is trying to use client2's code
                client_id: clientId,
                client_secret: secret,
                code: code
              }
            });
          }).then(function(res) {
            assert.equal(res.result.code, 400);
            assert.equal(res.result.message, 'Incorrect code');
          }).done(done, done);

        });

        it('must not have expired', function(_done) {
          this.slow(200);
          var exp = config.get('expiration.code');
          config.set('expiration.code', 50);
          function done() {
            config.set('expiration.code', exp);
            _done.apply(this, arguments);
          }
          mockAssertion().reply(200, VERIFY_GOOD);
          Server.api.post({
            url: '/authorization',
            payload: authParams()
          }).then(function(res) {
            return url.parse(res.result.redirect, true).query.code;
          }).delay(60).then(function(code) {
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                code: code
              }
            });
          }).then(function(res) {
            assert.equal(res.result.code, 400);
            assert.equal(res.result.message, 'Expired code');
          }).done(done, done);
        });
      });

      describe('response', function() {
        describe('access_type=online', function() {
          it('should return a correct response', function(done) {
            mockAssertion().reply(200, VERIFY_GOOD);
            Server.api.post({
              url: '/authorization',
              payload: authParams({
                scope: 'foo bar bar'
              })
            }).then(function(res) {
              assert.equal(res.statusCode, 200);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: url.parse(res.result.redirect, true).query.code,
                  foo: 'bar' // testing stripUnknown
                }
              });
            }).then(function(res) {
              assert.equal(res.statusCode, 200);
              assert.equal(res.result.token_type, 'bearer');
              assert(res.result.access_token);
              assert(!res.result.refresh_token);
              assert.equal(res.result.access_token.length,
                config.get('unique.token') * 2);
              assert.equal(res.result.scope, 'foo bar');
              assert.equal(res.result.auth_at, 123456);
            }).done(done, done);
          });
        });
        describe('access_type=offline', function() {
          it('should return a correct response', function(done) {
            mockAssertion().reply(200, VERIFY_GOOD);
            Server.api.post({
              url: '/authorization',
              payload: authParams({
                scope: 'foo bar bar',
                access_type: 'offline'
              })
            }).then(function(res) {
              assert.equal(res.statusCode, 200);
              return Server.api.post({
                url: '/token',
                payload: {
                  client_id: clientId,
                  client_secret: secret,
                  code: url.parse(res.result.redirect, true).query.code
                }
              });
            }).then(function(res) {
              assert.equal(res.statusCode, 200);
              assert.equal(res.result.token_type, 'bearer');
              assert(res.result.access_token);
              assert(res.result.refresh_token);
              assert.equal(res.result.access_token.length,
                config.get('unique.token') * 2);
              assert.equal(res.result.refresh_token.length,
                config.get('unique.token') * 2);
              assert.equal(res.result.scope, 'foo bar');
              assert.equal(res.result.auth_at, 123456);
            }).done(done, done);
          });
        });
      });

      it('with a blank scope', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            scope: undefined
          })
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          return Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: secret,
              code: url.parse(res.result.redirect, true).query.code
            }
          });
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.token_type, 'bearer');
          assert(res.result.access_token);
          assert.equal(res.result.access_token.length,
            config.get('unique.token') * 2);
          assert.equal(res.result.scope, '');
        }).done(done, done);
      });

    });

    describe('grant_type=refresh_token', function() {

      describe('?refresh_token', function() {

        it('should be required', function() {
          return Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: secret,
              grant_type: 'refresh_token'
            }
          }).then(function(res) {
            assertInvalidRequestParam(res.result, 'refresh_token');
          });
        });

        it('should be an existing token', function() {
          return Server.api.post({
            url: '/token',
            payload: {
              client_id: clientId,
              client_secret: secret,
              grant_type: 'refresh_token',
              refresh_token: unique.token().toString('hex')
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 400);
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
            trusted: true
          };
          return db.registerClient(client2).then(function(c) {
            id2 = c.id.toString('hex');
            return newToken({ access_type: 'offline' }); //for main client
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            var refresh = res.result.refresh_token;
            assert(refresh);
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: id2, // client2 stole it somehow
                client_secret: secret2,
                grant_type: 'refresh_token',
                refresh_token: refresh
              }
            });
          }).then(function(res) {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.errno, 109);
          });
        });

        it('should not create a new refresh token', function() {
          return newToken({ access_type: 'offline' }).then(function(res) {
            assert.equal(res.statusCode, 200);
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token
              }
            });
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.refresh_token, undefined);
          });
        });

      });

      describe('?scope', function() {

        it('should be able to reduce scopes', function() {
          return newToken({
            access_type: 'offline',
            scope: 'foo bar:baz'
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.scope, 'foo bar:baz');
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                scope: 'foo'
              }
            });
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.scope, 'foo');
          });
        });

        it('should not expand scopes', function() {
          return newToken({
            access_type: 'offline',
            scope: 'foo bar:baz'
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.scope, 'foo bar:baz');
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                scope: 'foo quux'
              }
            });
          }).then(function(res) {
            assert.equal(res.statusCode, 400);
            assert.equal(res.result.errno, 114);
          });
        });

      });

      describe('?ttl', function() {

        it('should reduce the expires_in of the access_token', function() {
          return newToken({ access_type: 'offline' }).then(function(res) {
            assert.equal(res.statusCode, 200);
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                ttl: 60
              }
            });
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert(res.result.expires_in <= 60);
          });
        });

        it('should not exceed the maximum', function() {
          return newToken({ access_type: 'offline' }).then(function(res) {
            assert.equal(res.statusCode, 200);
            return Server.api.post({
              url: '/token',
              payload: {
                client_id: clientId,
                client_secret: secret,
                grant_type: 'refresh_token',
                refresh_token: res.result.refresh_token,
                ttl: MAX_TTL_S * 100
              }
            });
          }).then(function(res) {
            assertInvalidRequestParam(res.result, 'ttl');
          });
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
      return db.generateAccessToken({
        clientId: buf(clientId),
        userId: buf(USERID),
        email: VEMAIL,
        scope: [auth.SCOPE_CLIENT_MANAGEMENT]
      }).then(function(token) {
        tok = token.token.toString('hex');
        return db.generateAccessToken({
          clientId: buf(clientId),
          userId: unique(16),
          email: 'user@not.allow.ed',
          scope: [auth.SCOPE_CLIENT_MANAGEMENT]
        });
      }).then(function(token) {
        badTok = token.token.toString('hex');
      });
    });

    describe('GET /:id', function() {
      describe('response', function() {
        it('should return the correct response', function(done) {
          Server.api.get('/client/' + clientId)
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            var body = res.result;
            assert.equal(body.name, client.name);
            assert(body.image_uri);
            assert(body.redirect_uri);
            assert(body.trusted);
          }).done(done, done);
        });
      });

      it('should allow for clients with no redirect_uri', function(done) {
        Server.api.get('/client/ea3ca969f8c6bb0d')
          .then(function(res) {
            assert.equal(res.statusCode, 200);
            var body = res.result;
            assert(body.name);
            assert.equal(body.image_uri, '');
            assert.equal(body.redirect_uri, '');
          }).done(done, done);
      });
    });

    describe('client management api', function() {
      it('should not be available on main server', function(){
        return P.all([
          Server.api.get('/clients'),
          Server.api.post('/client'),
          Server.api.post('/client/' + clientId),
          Server.api.delete('/client/' + clientId)
        ]).map(function(res) {
          assert.equal(res.statusCode, 404);
        });
      });

      describe('GET /client/:id', function() {
        describe('response', function() {
          it('should support the client id path', function(done) {
            Server.internal.api.get('/client/' + clientId)
              .then(function(res) {
                assert.equal(res.statusCode, 200);
                var body = res.result;
                assert.equal(body.name, client.name);
                assert(body.image_uri);
                assert(body.redirect_uri);
              }).done(done, done);
          });
        });
      });

      describe('GET /clients', function() {
        it('should require authorization', function() {
          return Server.internal.api.get({
            url: '/clients'
          }).then(function(res) {
            assert.equal(res.statusCode, 401);
          });
        });

        it('should check whether the user is allowed', function() {
          return Server.internal.api.get({
            url: '/clients',
            headers: {
              authorization: 'Bearer ' + badTok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 403);
          });
        });

        it('should return an empty list of clients', function() {
          // this developer has no clients associated, it returns 0
          // value is the same as the API endpoint and a DB call

          return Server.internal.api.get({
            url: '/clients',
            headers: {
              authorization: 'Bearer ' + tok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 200);

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
            }).then(function() {
              return db.getDeveloper(vemail);
            }).then(function(developer) {
              var devId = developer.developerId;
              return db.registerClientDeveloper(devId, clientId);
            }).then(function () {
              return Server.internal.api.get({
                url: '/clients',
                headers: {
                  authorization: 'Bearer ' + tok
                }
              });
            }).then(function(res) {
              assert.equal(res.statusCode, 200);
              return db.getClients(vemail).then(function(clients) {
                assert.equal(res.result.clients.length, clients.length);
                assert.equal(res.result.clients.length, 1);
              });
            });
        });
      });

      describe('POST', function() {
        before(function() {
          return Server.internal.api.post({
            url: '/developer/activate',
            headers: {
              authorization: 'Bearer ' + tok
            }
          }).then(function(res) {
          });
        });

        it('should register a client', function() {
          return Server.internal.api.post({
            url: '/client',
            headers: {
              authorization: 'Bearer ' + tok,
            },
            payload: {
              name: clientName,
              redirect_uri: clientUri,
              image_uri: clientUri + '/image',
              terms_uri: clientUri + '/terms',
              privacy_uri: clientUri + '/privacy',
              can_grant: true,
              trusted: true
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 201);
            var client = res.result;
            assert(client.id);
            return db.getClient(client.id).then(function(klient) {
              assert.equal(klient.id.toString('hex'), client.id);
              assert.equal(klient.name, client.name);
              assert.equal(klient.redirectUri, client.redirect_uri);
              assert.equal(klient.imageUri, client.image_uri);
              assert.equal(klient.termsUri, client.terms_uri);
              assert.equal(klient.privacyUri, client.privacy_uri);
              assert.equal(klient.redirectUri, clientUri);
              assert.equal(klient.imageUri, clientUri + '/image');
              assert.equal(klient.termsUri, clientUri + '/terms');
              assert.equal(klient.privacyUri, clientUri + '/privacy');
              assert.equal(klient.canGrant, true);
              assert.equal(klient.trusted, true);
            });
          });
        });

        it('should require authorization', function() {
          return Server.internal.api.post({
            url: '/client',
            payload: {
              name: 'dont matter'
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 401);
          });
        });

        it('should check the whether the user is allowed', function() {
          return Server.internal.api.post({
            url: '/client',
            headers: {
              authorization: 'Bearer ' + badTok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 403);
          });
        });

        it('should default optional fields to sensible values', function() {
          return Server.internal.api.post({
            url: '/client',
            headers: {
              authorization: 'Bearer ' + tok,
            },
            payload: {
              name: clientName,
              redirect_uri: clientUri
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 201);
            var client = res.result;
            assert(client.id);
            assert(client.image_uri === '');
            assert(client.can_grant === false);
            assert(client.trusted === false);
            return db.getClient(client.id).then(function(klient) {
              assert.equal(klient.id.toString('hex'), client.id);
              assert.equal(klient.name, client.name);
              assert.equal(klient.imageUri, '');
              assert.equal(klient.termsUri, '');
              assert.equal(klient.privacyUri, '');
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
            trusted: true
          };

          return db.registerClient(client)
            .then(function () {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            }).then(function () {
              return db.getDeveloper(vemail);
            }).then(function (developer) {
            }).then(function () {
              return Server.internal.api.post({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
                payload: {
                  name: 'updated',
                  redirect_uri: clientUri
                }
              });
            }).then(function (res) {
              assert.equal(res.statusCode, 401);
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
            termsUri: 'https://example.com/legal/terms.html',
            privacyUri: 'https://example.com/legal/privacy.html',
            trusted: true
          };

          return db.registerClient(client)
            .then(function () {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            }).then(function () {
              return db.getDeveloper(vemail);
            }).then(function (developer) {
              devId = developer.developerId;
            }).then(function () {
              return db.registerClientDeveloper(
                devId.toString('hex'),
                id.toString('hex')
              );
            }).then(function () {
              return Server.internal.api.post({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
                payload: {
                  name: 'updated',
                  redirect_uri: clientUri
                }
              });
            }).then(function (res) {
              assert.equal(res.statusCode, 200);
              assert.equal(res.payload, '{}');
              return db.getClient(client.id);
            }).then(function (klient) {
              assert.equal(klient.name, 'updated');
              assert.equal(klient.redirectUri, clientUri);
              assert.equal(klient.imageUri, client.imageUri);
              assert.equal(klient.termsUri, client.termsUri);
              assert.equal(klient.privacyUri, client.privacyUri);
              assert.equal(klient.trusted, true);
              assert.equal(klient.canGrant, false);
            }).then(function () {
              return Server.internal.api.post({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                },
                payload: {
                  terms_uri: clientUri + '/terms',
                  privacy_uri: clientUri + '/privacy',
                }
              });
            }).then(function (res) {
              assert.equal(res.statusCode, 200);
              assert.equal(res.payload, '{}');
              return db.getClient(client.id);
            }).then(function (klient) {
              assert.equal(klient.name, 'updated');
              assert.equal(klient.redirectUri, clientUri);
              assert.equal(klient.imageUri, client.imageUri);
              assert.equal(klient.termsUri, clientUri + '/terms');
              assert.equal(klient.privacyUri, clientUri + '/privacy');
            });
        });

        it('should forbid unknown properties', function () {
          return Server.internal.api.post({
            url: '/client/' + id.toString('hex'),
            headers: {
              authorization: 'Bearer ' + tok
            },
            payload: {
              foo: 'bar'
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 400);
          });
        });

        it('should require authorization', function() {
          return Server.internal.api.post({
            url: '/client/' + id.toString('hex'),
            payload: {
              name: 'dont matter'
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 401);
          });
        });

        it('should check the whether the user is allowed', function() {
          return Server.internal.api.post({
            url: '/client/' + id.toString('hex'),
            headers: {
              authorization: 'Bearer ' + badTok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 403);
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
            trusted: true
          };

          return db.registerClient(client)
            .then(function () {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            }).then(function () {
              return db.getDeveloper(vemail);
            }).then(function (developer) {
              devId = developer.developerId;
            }).then(function () {
              return db.registerClientDeveloper(
                devId.toString('hex'),
                id.toString('hex')
              );
            }).then(function () {
              return Server.internal.api.delete({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                }
              });
            }).then(function(res) {
              assert.equal(res.statusCode, 204);
              return db.getClient(id);
            }).then(function(client) {
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
            trusted: true
          };

          return db.registerClient(client)
            .then(function () {
              return getUniqueUserAndToken(id.toString('hex'));
            })
            .then(function(data) {
              tok = data.token;
              vemail = data.email;

              return db.activateDeveloper(vemail);
            }).then(function () {
              return db.getDeveloper(vemail);
            }).then(function (developer) {
            }).then(function () {
              return Server.internal.api.delete({
                url: '/client/' + id.toString('hex'),
                headers: {
                  authorization: 'Bearer ' + tok,
                }
              });
            }).then(function(res) {
              assert.equal(res.statusCode, 401);
              return db.getClient(id);
            }).then(function(klient) {
              assert.equal(klient.id.toString('hex'), id.toString('hex'));
            });
        });

        it('should require authorization', function() {
          var id = unique.id();

          return Server.internal.api.delete({
            url: '/client/' + id.toString('hex'),
            payload: {
              name: 'dont matter'
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 401);
          });
        });

        it('should check the whether the user is allowed', function() {
          var id = unique.id();

          return Server.internal.api.delete({
            url: '/client/' + id.toString('hex'),
            headers: {
              authorization: 'Bearer ' + badTok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 403);
          });
        });
      });
    });

  });

  describe('/developer', function() {
    describe('POST /developer/activate', function() {
      it('should create a developer', function(done) {
        var vemail, tok;

        return getUniqueUserAndToken(clientId)
          .then(function(data) {
            tok = data.token;
            vemail = data.email;

            return db.getDeveloper(vemail);
          }).then(function(developer) {
            assert.equal(developer, null);

            return Server.internal.api.post({
              url: '/developer/activate',
              headers: {
                authorization: 'Bearer ' + tok
              }
            });

          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.result.email, vemail);
            assert(res.result.developerId);
            assert(res.result.createdAt);

            return db.getDeveloper(vemail);
          }).then(function(developer) {

            assert.equal(developer.email, vemail);
          }).done(done, done);
      });
    });

    describe('GET /developer', function() {
      it('should not exist', function(done) {
        Server.internal.api.get('/developer')
          .then(function(res) {
            assert.equal(res.statusCode, 404);
          }).done(done, done);
      });
    });

  });

  describe('/verify', function() {

    describe('unknown token', function() {
      it('should not error', function() {
        return Server.api.post({
          url: '/verify',
          payload: {
            token: unique.token().toString('hex')
          }
        }).then(function(res) {
          assert.equal(res.statusCode, 400);
        });
      });
    });

    it.skip('should reject expired tokens', function() {
      this.slow(2200);
      return newToken({
        ttl: 1
      }).delay(1500).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.expires_in, 1);
        return Server.api.post({
          url: '/verify',
          payload: {
            token: res.result.access_token
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 400);
        assert.equal(res.result.errno, 115);
      });
    });

    describe('response', function() {
      it('should return the correct response', function(done) {
        newToken({
          scope: 'profile'
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token
            }
          });
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.user, USERID);
          assert.equal(res.result.client_id, clientId);
          assert.equal(res.result.scope[0], 'profile');
          assert.equal(res.result.email, VEMAIL);
        }).done(done, done);
      });
    });

    it('should return the email with profile:email scope', function(done) {
      newToken({ scope: 'profile:email' }).then(function(res) {
        assert.equal(res.statusCode, 200);
        return Server.api.post({
          url: '/verify',
          payload: {
            token: res.result.access_token
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.equal(res.result.email, VEMAIL);
      }).done(done, done);
    });

  });

  describe('/destroy', function() {
    it('should destroy access tokens', function() {
      var token;
      return newToken().then(function(res) {
        token = res.result.access_token;
        return Server.api.post({
          url: '/destroy',
          payload: {
            token: token
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.result, {});
        return db.getAccessToken(encrypt.hash(token)).then(function(tok) {
          assert.equal(tok, undefined);
        });
      });
    });

    it('should destroy refresh tokens', function() {
      var token;
      return newToken({ access_type: 'offline' }).then(function(res) {
        token = res.result.refresh_token;
        return Server.api.post({
          url: '/destroy',
          payload: {
            refresh_token: token
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.result, {});
        return db.getRefreshToken(encrypt.hash(token)).then(function(tok) {
          assert.equal(tok, undefined);
        });
      });
    });
    it('should accept client_secret', function() {
      return newToken().then(function(res) {
        return Server.api.post({
          url: '/destroy',
          payload: {
            token: res.result.access_token,
            client_secret: 'foo'
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
      });
    });
    it('should accept empty client_secret', function() {
      return newToken().then(function(res) {
        return Server.api.post({
          url: '/destroy',
          payload: {
            token: res.result.access_token,
            client_secret: ''
          }
        });
      }).then(function(res) {
        assert.equal(res.statusCode, 200);
      });
    });
  });
});
