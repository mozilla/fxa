/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');

const { assert } = require('chai');
const buf = require('buf').hex;

const db = require('../../../lib/oauth/db');
const auth = require('../../../lib/oauth/auth_client_management');
const Promise = require('../../../lib/promise');

function randomString(len) {
  return crypto.randomBytes(Math.ceil(len)).toString('hex');
}

function makeTests(name, purgeMethod) {
  return describe(name, function() {
    var clientIdA;
    var clientIdB;
    var userId;
    var email;

    function seedTokens(client, userId, email, count, expiresAt) {
      var accessTokens = [];
      for (var i = 0; i < count; i++) {
        accessTokens.push({
          clientId: buf(client),
          userId: buf(userId),
          email: email,
          scope: [auth.SCOPE_CLIENT_MANAGEMENT],
          expiresAt: expiresAt,
        });
      }

      return Promise.each(accessTokens, function(options) {
        return db.generateAccessToken(options);
      });
    }

    // Inserts 2000 access tokens with the following breakdown
    // ClientIdA - 500 expired, 500 valid
    // ClientIdB - 500 expired, 500 valid
    before('setup clients', function() {
      email = 'asdf@asdf.com';
      clientIdA = randomString(8);
      clientIdB = randomString(8);
      userId = buf(randomString(16));

      return db
        .registerClient({
          id: clientIdA,
          name: 'ClientA',
          hashedSecret: randomString(32),
          imageUri: 'https://example.domain/logo',
          redirectUri: 'https://example.domain/return?foo=bar',
          trusted: true,
        })
        .then(function() {
          return db.registerClient({
            id: clientIdB,
            name: 'ClientB',
            hashedSecret: randomString(32),
            imageUri: 'https://example.domain/logo',
            redirectUri: 'https://example.domain/return?foo=bar',
            trusted: true,
          });
        });
    });

    beforeEach('seed with tokens', function() {
      this.timeout(30000);
      return db
        ._write('DELETE FROM tokens;')
        .then(function() {
          return seedTokens(clientIdA, userId, email, 500);
        })
        .then(function() {
          return seedTokens(clientIdB, userId, email, 500);
        })
        .then(function() {
          return seedTokens(
            clientIdA,
            userId,
            email,
            500,
            new Date(Date.now() - 1000 * 600)
          );
        })
        .then(function() {
          return seedTokens(
            clientIdB,
            userId,
            email,
            500,
            new Date(Date.now() - 1000 * 600)
          );
        });
    });

    it('should fail purgeExpiredTokens without ignoreClientId', function() {
      return purgeMethod(1000, 5)
        .then(function() {
          assert.fail(
            'purgeExpiredTokens() should fail with an empty ignoreClientId'
          );
        })
        .catch(function(error) {
          assert.equal(error.message, 'empty ignoreClientId');
        });
    });

    it('should fail purgeExpiredTokens with an unknown ignoreClientId', function() {
      var unknownClientId = 'deadbeefdeadbeef';
      return purgeMethod(1000, 5, unknownClientId)
        .then(function() {
          assert.fail(
            'purgeExpiredTokens() should fail with an unknown ignoreClientId'
          );
        })
        .catch(function(error) {
          assert.equal(
            error.message,
            'unknown ignoreClientId ' + unknownClientId
          );
        });
    });

    it('should call purgeExpiredTokens and ignore client', function() {
      return purgeMethod(1000, 0, clientIdA, 1000)
        .then(function() {
          // Check clientA tokens not deleted
          return db._read(
            'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?);',
            [clientIdA]
          );
        })
        .then(function(result) {
          assert.equal(result[0].count, 1000);
        })
        .then(function() {
          // Check clientB expired tokens are deleted
          return db._read(
            'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?) AND expiresAt < NOW();',
            [clientIdB]
          );
        })
        .then(function(result) {
          assert.equal(result[0].count, 0);
        })
        .then(function() {
          // Check clientB unexpired tokens are not deleted
          return db._read(
            'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?) AND expiresAt > NOW();',
            [clientIdB]
          );
        })
        .then(function(result) {
          assert.equal(result[0].count, 500);
        })
        .then(function() {
          // Check the total tokens
          return db._read('SELECT COUNT(*) AS count FROM fxa_oauth.tokens;');
        })
        .then(function(result) {
          assert.equal(result[0].count, 1500);
        });
    });

    if (purgeMethod === db.purgeExpiredTokens) {
      // purgeExpiredTokensById cannot meet the expectations of this
      // test. Not less correct, just different.
      it('should call purgeExpiredTokens and only purge 100 items', function() {
        return purgeMethod(100, 0, clientIdA, 1000)
          .then(function() {
            // Check clientA tokens not deleted
            return db._read(
              'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?);',
              [clientIdA]
            );
          })
          .then(function(result) {
            assert.equal(result[0].count, 1000);
          })
          .then(function() {
            // Check clientB only 100 expired tokens are deleted
            return db._read(
              'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?) AND expiresAt < NOW();',
              [clientIdB]
            );
          })
          .then(function(result) {
            assert.equal(result[0].count, 400);
          })
          .then(function() {
            // Check clientB unexpired tokens are not deleted
            return db._read(
              'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?) AND expiresAt > NOW();',
              [clientIdB]
            );
          })
          .then(function(result) {
            assert.equal(result[0].count, 500);
          })
          .then(function() {
            // Check the total tokens
            return db._read('SELECT COUNT(*) AS count FROM fxa_oauth.tokens;');
          })
          .then(function(result) {
            assert.equal(result[0].count, 1900);
          });
      });
    }

    it('should call purgeExpiredTokens and ignore both clients as requested', function() {
      return purgeMethod(1000, 0, [clientIdA, clientIdB])
        .then(function() {
          // Check clientA tokens not deleted
          return db._read(
            'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?)',
            [clientIdA]
          );
        })
        .then(function(result) {
          assert.equal(result[0].count, 1000);
        })
        .then(function() {
          // Check clientB expired tokens are not deleted
          return db._read(
            'SELECT COUNT(*) AS count FROM fxa_oauth.tokens WHERE clientId=UNHEX(?)',
            [clientIdB]
          );
        })
        .then(function(result) {
          assert.equal(result[0].count, 1000);
        })
        .then(function() {
          // Check the total tokens
          return db._read('SELECT COUNT(*) AS count FROM fxa_oauth.tokens');
        })
        .then(function(result) {
          assert.equal(result[0].count, 2000);
        });
    });
  });
}

describe('db', function() {
  return makeTests('purgeExpiredTokens', db.purgeExpiredTokens);
});

describe('db', function() {
  return makeTests('purgeExpiredTokensById', db.purgeExpiredTokensById);
});
