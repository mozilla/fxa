/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');

const assert = require('insist');
const jwcrypto = require('jwcrypto');
const nock = require('nock');


const config = require('../lib/config');
const db = require('../lib/db');
const Promise = require('../lib/promise');
const Server = require('./lib/server');
const unique = require('../lib/unique');

require('jwcrypto/lib/algs/ds');

/*global describe,it,before,afterEach*/
/*jshint camelcase: false*/

const USERID = unique.id().toString('hex');
const VERIFY_GOOD = JSON.stringify({
  status: 'okay',
  email: USERID + '@' + config.get('browserid.issuer')
});

function mockAssertion() {
  var parts = url.parse(config.get('browserid.verificationUrl'));
  return nock(parts.protocol + '//' + parts.host).post(parts.path);
}

var genKeypair = Promise.promisify(jwcrypto.generateKeypair);
var certSign = Promise.promisify(jwcrypto.cert.sign);
var assertionSign = Promise.promisify(jwcrypto.assertion.sign);
function genAssertion(email) {
  // seriously wtf. creating assertions is atrocious
  return Promise.all([
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
    return Promise.all([
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

function assertRequestParam(result, param) {
  assert.equal(result.code, 400);
  assert.equal(result.message, 'Invalid request parameter');
  assert.equal(result.validation.keys.length, 1);
  assert.equal(result.validation.keys[0], param);
}

describe('/oauth', function() {

  var client;
  var secret = unique.secret().toString('hex');
  var clientId;
  var AN_ASSERTION;
  before(function(done) {

    Promise.all([
      genAssertion(USERID + config.get('browserid.issuer')).then(function(ass) {
        AN_ASSERTION = ass;
      }),
      db.registerClient({
        name: 'Mocha',
        redirectUri: 'https://example.domain/return?foo=bar',
        whitelisted: true,
        secret: secret
      }).then(function(c) {
        client = c;
        clientId = client.id.toString('hex');
      })
    ]).done(function() { done(); }, done);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  describe('/authorization', function() {

    describe('?client_id', function() {

      it('is required', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION
        }).then(function(res) {
          assertRequestParam(res.result, 'client_id');
        }).done(done, done);
      });

      it('succeeds if passed', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION +
            '&client_id=' + clientId
        }).then(function(res) {
          assert.equal(res.statusCode, 302);
        }).done(done, done);
      });

    });

    describe('?assertion', function() {

      it('is required', function(done) {
        Server.get({
          url: '/oauth/authorization?client_id=' + clientId
        }).then(function(res) {
          assertRequestParam(res.result, 'assertion');
        }).done(done, done);
      });

      it('succeeds if passed', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION +
            '&client_id=' + clientId
        }).then(function(res) {
          assert.equal(res.statusCode, 302);
        }).done(done, done);
      });

      it('errors correctly if invalid', function(done) {
        mockAssertion().reply(400, '{"status":"failure"}');
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION +
            '&client_id=' + clientId
        }).then(function(res) {
          assert.equal(res.result.code, 400);
          assert.equal(res.result.message, 'Invalid assertion');
        }).done(done, done);
      });

    });

    describe('?redirect_uri', function() {
      it('is optional', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION +
            '&client_id=' + clientId + '&redirect_uri=' + client.redirectUri
        }).then(function(res) {
          assert.equal(res.statusCode, 302);
        }).done(done, done);
      });

      it('must be same as registered redirect', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION + '&client_id='
            + clientId + '&redirect_uri=http://derp.herp'
        }).then(function(res) {
          assert.equal(res.result.code, 400);
          assert.equal(res.result.message, 'Incorrect redirect_uri');
        }).done(done, done);
      });
    });

    describe('?state', function() {
      it('is returned if passed', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?state=1&assertion=' + AN_ASSERTION +
            '&client_id=' + clientId
        }).then(function(res) {
          assert.equal(res.statusCode, 302);
          assert.equal(url.parse(res.headers.location, true).query.state, 1);
        }).done(done, done);
      });
    });

    describe('?scope', function() {
      it('is optional', function(done) {
        mockAssertion().reply(200, VERIFY_GOOD);
        Server.get({
          url: '/oauth/authorization?scope=1&assertion=' + AN_ASSERTION +
            '&client_id=' + clientId
        }).then(function(res) {
          assert.equal(res.statusCode, 302);
        }).done(done, done);
      });
    });

    describe('response', function() {
      describe('with a whitelisted client', function() {
        it('should redirect to the redirect_uri', function(done) {
          mockAssertion().reply(200, VERIFY_GOOD);
          Server.get({
            url: '/oauth/authorization?assertion=' + AN_ASSERTION +
              '&client_id=' + clientId + '&redirect_uri=' + client.redirectUri
          }).then(function(res) {
            assert.equal(res.statusCode, 302);
            var loc = url.parse(res.headers.location, true);
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
      Server.get('/oauth/token').then(function(res) {
        assert.equal(res.statusCode, 404);
      }).done(done, done);
    });

    describe('?client_id', function() {
      it('is required', function(done) {
        Server.post({
          url: '/oauth/token',
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
        Server.post({
          url: '/oauth/token',
          payload: {
            client_id: clientId,
            code: unique.code().toString('hex')
          }
        }).then(function(res) {
          assertRequestParam(res.result, 'client_secret');
        }).done(done, done);
      });

      it('must match server-stored secret', function(done) {
        Server.post({
          url: '/oauth/token',
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
        Server.post({
          url: '/oauth/token',
          payload: {
            client_id: clientId,
            client_secret: secret
          }
        }).then(function(res) {
          assertRequestParam(res.result, 'code');
        }).done(done, done);
      });

      it('must match an existing code', function(done) {
        Server.post({
          url: '/oauth/token',
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
          whitelisted: true
        };
        db.registerClient(client2).then(function() {
          mockAssertion().reply(200, VERIFY_GOOD);
          return Server.get({
            url: '/oauth/authorization?assertion=' + AN_ASSERTION +
              '&client_id=' + client2.id.toString('hex')
          }).then(function(res) {
            return url.parse(res.headers.location, true).query.code;
          });
        }).then(function(code) {
          return Server.post({
            url: '/oauth/token',
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
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION +
            '&client_id=' + clientId
        }).then(function(res) {
          return url.parse(res.headers.location, true).query.code;
        }).delay(60).then(function(code) {
          return Server.post({
            url: '/oauth/token',
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
        Server.get({
          url: '/oauth/authorization?assertion=' + AN_ASSERTION +
            '&client_id=' + clientId + '&scope=foo%20bar%20bar'
        }).then(function(res) {
          assert.equal(res.statusCode, 302);
          return Server.post({
            url: '/oauth/token',
            payload: {
              client_id: clientId,
              client_secret: secret,
              code: url.parse(res.headers.location, true).query.code
            }
          });
        }).then(function(res) {
          assert.equal(res.statusCode, 200);
          assert.equal(res.result.token_type, 'bearer');
          assert(res.result.access_token);
          assert.equal(res.result.access_token.length,
            config.get('unique.token') * 2);
          assert.deepEqual(res.result.scopes, ['foo', 'bar']);
        }).done(done, done);
      });
    });
  });

});
