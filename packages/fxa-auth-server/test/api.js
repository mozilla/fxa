/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const assert = require('insist');
const jwcrypto = require('jwcrypto');
const nock = require('nock');


const config = require('../lib/config');
const db = require('../lib/db');
const P = require('../lib/promise');
const Server = require('./lib/server');
const unique = require('../lib/unique');

require('jwcrypto/lib/algs/ds');

/*global describe,it,before,afterEach*/
/*jshint camelcase: false*/

const USERID = unique.id().toString('hex');
const VEMAIL = 'user@example.domain';
const VERIFY_GOOD = JSON.stringify({
  status: 'okay',
  email: USERID + '@' + config.get('browserid.issuer'),
  issuer: config.get('browserid.issuer'),
  idpClaims: {
    'fxa-verifiedEmail': VEMAIL
  }
});

function mockAssertion() {
  var parts = url.parse(config.get('browserid.verificationUrl'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path);
}

var genKeypair = P.promisify(jwcrypto.generateKeypair);
var certSign = P.promisify(jwcrypto.cert.sign);
var assertionSign = P.promisify(jwcrypto.assertion.sign);
function genAssertion(email) {
  // seriously wtf. creating assertions is atrocious
  return P.all([
    genKeypair({
      algorithm: 'DSA',
      keysize: 256
    }),
    genKeypair({
      algorithm: 'DSA',
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
    return jwcrypto.cert.bundle([cert], assertion);
  });
}


var client;
var secret;
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
        secret = client.secret;
      })
    ]).done(function() { done(); }, done);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('/authorization', function() {

    describe('GET', function() {
      it('redirects with all query params', function(done) {
        Server.api.get('/authorization?client_id=123&state=321&scope=1')
        .then(function(res) {
          assert.equal(res.statusCode, 302);
          var redirect = url.parse(res.headers.location, true);

          assert.equal(redirect.query.client_id, '123');
          assert.equal(redirect.query.state, '321');
          assert.equal(redirect.query.scope, '1');

          var target = url.parse(config.get('contentUrl'), true);
          assert.equal(redirect.pathname, target.pathname);
          assert.equal(redirect.host, target.host);
        }).done(done, done);
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

      it('succeeds if passed', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams()
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert(res.result.redirect);
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

      it('succeeds if passed', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams()
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert(res.result.redirect);
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

      it('must be same as registered redirect', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            redirect_uri: 'http://herp.derp'
          })
        }).then(function(res) {
          assert.equal(res.result.code, 400);
          assert.equal(res.result.message, 'Incorrect redirect_uri');
        }).done(done, done);
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
            client_secret: unique.secret().toString('hex'),
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
          secret: secret2,
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
              code: url.parse(res.result.redirect, true).query.code
            }
          });
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.token_type, 'bearer');
          assert(res.result.access_token);
          assert.equal(res.result.access_token.length,
            config.get('unique.token') * 2);
          assert.equal(res.result.scope, 'foo bar');
        }).done(done, done);
      });
    });
  });

  describe('/client/:id', function() {
    describe('response', function() {
      it('should return the correct response', function(done) {
        Server.api.get('/client/' + clientId)
        .then(function(res) {
          assert.equal(res.statusCode, 200);
          var body = res.result;
          assert.equal(body.name, client.name);
        }).done(done, done);
      });
    });
  });

  describe('/verify', function() {

    describe('response', function() {
      it('should return the correct response', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.api.post({
          url: '/authorization',
          payload: authParams({
            scope: 'profile'
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
          return Server.api.post({
            url: '/verify',
            payload: {
              token: res.result.access_token
            }
          });
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.user, USERID);
          assert.equal(res.result.scope[0], 'profile');
          assert.equal(res.result.email, VEMAIL);
        }).done(done, done);
      });
    });

  });

});
