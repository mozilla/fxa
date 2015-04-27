/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const assert = require('insist');
const bidcrypto = require('browserid-crypto');
const nock = require('nock');
const buf = require('buf').hex;

const auth = require('../lib/auth');
const config = require('../lib/config');
const db = require('../lib/db');
const encrypt = require('../lib/encrypt');
const P = require('../lib/promise');
const Server = require('./lib/server');
const unique = require('../lib/unique');

require('browserid-crypto/lib/algs/ds');

/*global describe,it,before,beforeEach,afterEach*/
/*jshint camelcase: false*/

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

function mockAssertion() {
  var parts = url.parse(config.get('browserid.verificationUrl'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path);
}

var genKeypair = P.promisify(bidcrypto.generateKeypair);
var certSign = P.promisify(bidcrypto.cert.sign);
var assertionSign = P.promisify(bidcrypto.assertion.sign);
function genAssertion(email) {
  // seriously wtf. creating assertions is atrocious
  return P.all([
    genKeypair({
      algorithm: 'DS',
      keysize: 256
    }),
    genKeypair({
      algorithm: 'DS',
      keysize: 256
    })
  ]).spread(function(idp, user) {
    var expiration = new Date();
    return P.all([
      certSign({
        publicKey: user.publicKey,
        // see fxa-assertion format
        principal: {
          email: email
        }
      }, {
        expiresAt: expiration,
        issuer: config.get('browserid.issuer'),
        issuedAt: new Date()
      }, {
        'fxa-verifiedEmail': VEMAIL
      },
      idp.secretKey),
      assertionSign({}, {
        audience: 'oauth.fxa',
        issuer: config.get('browserid.issuer'),
        expiresAt: new Date()
      }, user.secretKey)
    ]);
  }).spread(function (cert, assertion) {
    return bidcrypto.cert.bundle([cert], assertion);
  });
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
  for (var key in params) {
    defaults[key] = params[key];
  }
  return defaults;
}

function newToken(payload) {
  mockAssertion().reply(200, VERIFY_GOOD);
  return Server.api.post({
    url: '/authorization',
    payload: authParams(payload || {})
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
  });
}

function assertRequestParam(result, param) {
  assert.equal(result.code, 400);
  assert.equal(result.message, 'Invalid request parameter');
  assert.equal(result.validation.keys.length, 1);
  assert.equal(result.validation.keys[0], param);
}


describe('/v1', function() {
  before(function(done) {

    P.all([
      genAssertion(USERID + config.get('browserid.issuer')).then(function(ass) {
        AN_ASSERTION = ass;
      }),
      db.ping().then(function() {
        client = config.get('clients')[0];
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

    describe('?client_id', function() {

      it('is required', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            client_id: undefined
          })
        }).then(function(res) {
          assertRequestParam(res.result, 'client_id');
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
          assertRequestParam(res.result, 'assertion');
        }).done(done, done);
      });

      it('errors correctly if invalid', function(done) {
        mockAssertion().reply(400, '{"status":"failure"}');
        Server.api.post({
          url: '/authorization',
          payload: authParams()
        }).then(function(res) {
          assert.equal(res.result.code, 400);
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
          assertRequestParam(res.result, 'state');
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

      describe('token', function() {
        var client2 = config.get('clients')[1];
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
            assert.equal(res.statusCode, 200);
            assert(res.result.access_token);
            assert.equal(res.result.token_type, 'bearer');
            assert(res.result.scope);
            assert(res.result.auth_at);
          }).done(done, done);
        });
      });
    });

    describe('response', function() {
      describe('with a whitelisted client', function() {
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
          assertRequestParam(res.result, 'client_id');
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
          assertRequestParam(res.result, 'client_secret');
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

    describe('?code', function() {
      it('is required', function(done) {
        Server.api.post({
          url: '/token',
          payload: {
            client_id: clientId,
            client_secret: secret
          }
        }).then(function(res) {
          assertRequestParam(res.result, 'code');
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
          whitelisted: true
        };
        db.registerClient(client2).then(function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.api.post({
            url: '/authorization',
            payload: authParams({
              client_id: client2.id.toString('hex')
            })
          }).then(function(res) {
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
          assert.equal(res.result.access_token.length,
            config.get('unique.token') * 2);
          assert.equal(res.result.scope, 'foo bar');
          assert.equal(res.result.auth_at, 123456);
        }).done(done, done);
      });
    });

    it('should work if no scope was requested', function(done) {
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

  describe('/client', function() {
    var clientName = 'test/api/client';
    var clientUri = 'http://test.api/client';

    var tok;
    var badTok;

    before(function() {
      return db.generateToken({
        clientId: buf(clientId),
        userId: buf(USERID),
        email: VEMAIL,
        scope: [auth.SCOPE_CLIENT_MANAGEMENT]
      }).then(function(token) {
        tok = token.token.toString('hex');
        return db.generateToken({
          clientId: buf(clientId),
          userId: unique(16),
          email: 'user@not.white.list.ed',
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

        it('should check the whitelist', function() {
          return Server.internal.api.get({
            url: '/clients',
            headers: {
              authorization: 'Bearer ' + badTok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 403);
          });
        });

        it('should return a list of clients', function() {
          return Server.internal.api.get({
            url: '/clients',
            headers: {
              authorization: 'Bearer ' + tok
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            return db.getClients().then(function(clients) {
              assert.equal(res.result.clients.length, clients.length);
            });
          });
        });
      });

      describe('POST', function() {
        it('should register a client', function() {
          return Server.internal.api.post({
            url: '/client',
            headers: {
              authorization: 'Bearer ' + tok,
            },
            payload: {
              name: clientName,
              redirect_uri: clientUri,
              image_uri: clientUri,
              can_grant: true,
              whitelisted: true
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 201);
            var client = res.result;
            assert(client.id);
            return db.getClient(client.id).then(function(klient) {
              assert.equal(klient.id.toString('hex'), client.id);
              assert.equal(klient.name, client.name);
              assert.equal(klient.redirectUri, client.redirect_uri);
              assert.equal(klient.canGrant, true);
              assert.equal(klient.whitelisted, true);
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

        it('should check the whitelist', function() {
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
            assert(client.whitelisted === false);
            return db.getClient(client.id).then(function(klient) {
              assert.equal(klient.id.toString('hex'), client.id);
              assert.equal(klient.name, client.name);
              assert.equal(klient.imageUri, '');
              assert.equal(klient.canGrant, false);
              assert.equal(klient.whitelisted, false);
            });
          });
        });
      });

      describe('POST /:id', function() {
        var id = unique.id();
        it('should update the client', function() {
          var secret = unique.secret();
          var imageUri = 'https://example.foo.domain/logo.png';
          var client = {
            name: 'test/api/update',
            id: id,
            hashedSecret: encrypt.hash(secret),
            redirectUri: 'https://example.domain',
            imageUri: imageUri,
            whitelisted: true
          };
          return db.registerClient(client).then(function() {
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
          }).then(function(res) {
            assert.equal(res.statusCode, 200);
            assert.equal(res.payload, '{}');
            return db.getClient(id);
          }).then(function(klient) {
            assert.equal(klient.name, 'updated');
            assert.equal(klient.redirectUri, clientUri);
            assert.equal(klient.imageUri, imageUri);
            assert.equal(klient.whitelisted, true);
            assert.equal(klient.canGrant, false);
          });
        });

        it('should forbid unknown properties', function() {
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

        it('should check the whitelist', function() {
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
        var id = unique.id();
        it('should delete the client', function() {
          var secret = unique.secret();
          var client = {
            name: 'test/api/delete',
            id: id,
            hashedSecret: encrypt.hash(secret),
            redirectUri: clientUri,
            imageUri: clientUri,
            whitelisted: true
          };
          return db.registerClient(client).then(function() {
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

        it('should require authorization', function() {
          return Server.internal.api.delete({
            url: '/client/' + id.toString('hex'),
            payload: {
              name: 'dont matter'
            }
          }).then(function(res) {
            assert.equal(res.statusCode, 401);
          });
        });

        it('should check the whitelist', function() {
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
    it('should destroy tokens', function() {
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
        return db.getToken(encrypt.hash(token)).then(function(tok) {
          assert.equal(tok, undefined);
        });
      });
    });
  });

});
