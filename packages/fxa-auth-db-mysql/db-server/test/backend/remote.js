/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

'use strict';

const { assert } = require('chai');
const crypto = require('crypto');
const fake = require('../fake');
const P = require('../../../lib/promise');
const clientThen = require('../client-then');

function emailToHex(email) {
  return Buffer.from(email).toString('hex');
}

// Helper function that performs two tests:
//
// (1) checks that the response is a 200
// (2) checks that the content-type header is correct
function respOk(r) {
  assert.equal(r.res.statusCode, 200, 'returns a 200');
  assert.equal(
    r.res.headers['content-type'],
    'application/json',
    'json is returned'
  );
}

// Helper function that performs three tests:
//
// (1) checks that the response is a 200
// (2) checks that the content-type header is correct
// (3) checks that the response was an empty object
function respOkEmpty(r) {
  assert.equal(r.res.statusCode, 200, 'returns a 200');
  assert.equal(
    r.res.headers['content-type'],
    'application/json',
    'json is returned'
  );
  assert.deepEqual(r.obj, {}, 'Returned object is empty');
}

// Helper function that performs two tests:
//
// (1) checks that the response is a 404
// (2) checks that the error body for a 404 is consistent
function testNotFound(err) {
  assert.equal(err.statusCode, 404, 'returns a 404');
  assert.deepEqual(
    err.body,
    {
      message: 'Not Found',
      errno: 116,
      error: 'Not Found',
      code: 404,
    },
    'Object contains no other fields'
  );
}

// Helper function that performs two tests:
//
// (1) checks that the response is a 409
// (2) checks that the error body for a 409 is consistent
function testConflict(err) {
  assert.equal(err.statusCode, 409, 'err.statusCode should be 409');
  assert.deepEqual(
    err.body,
    {
      message: 'Record already exists',
      errno: 101,
      error: 'Conflict',
      code: 409,
    },
    'err.body should have correct properties set'
  );
}

// Helper function that tests for the server failure event.
//
// Returns a promise to be resolved with failure event
// when one is emitted by the server.
function captureFailureEvent(server) {
  return new P(function (resolve, reject) {
    server.once('failure', resolve);
  });
}

// Helper test that calls the version route and checks response that checks the version route response.
//
// Takes the client, and a route, either '/' or '/__version__'.
//
function testVersionResponse(client, route) {
  return client.getThen(route).then(function (r) {
    assert.equal(r.res.statusCode, 200, 'version returns 200 OK');
    assert.match(r.obj.version, /\d+\.\d+\.\d+/);
    assert.include(['MySql'], r.obj.implementation);
  });
}

// To run these tests from a new backend, create a DB instance, start a test server
// and pass the config containing the connection params to this function. The tests
// will run against that server. Second argument is the restify server object, for
// testing of events via `server.on`.
module.exports = function (cfg, makeServer) {
  describe('remote', () => {
    let client;
    let server;
    before(() => {
      return makeServer().then((s) => {
        server = s;
        client = clientThen({ url: 'http://' + cfg.hostname + ':' + cfg.port });
      });
    });

    it('heartbeat', () => {
      return client.getThen('/__heartbeat__').then(function (r) {
        assert.deepEqual(
          r.obj,
          {},
          'Heartbeat contains an empty object and nothing unexpected'
        );
      });
    });

    it('version', () => testVersionResponse(client, '/'));
    it('version', () => testVersionResponse(client, '/__version__'));

    it('account not found', () => {
      return client.getThen('/account/0123456789ABCDEF0123456789ABCDEF').then(
        function (r) {
          assert(
            false,
            'This request should have failed (instead it suceeded)'
          );
        },
        function (err) {
          testNotFound(err);
        }
      );
    });

    it('add account, add email, get secondary email, get emails, delete email', async () => {
      const user = fake.newUserDataHex();
      const secondEmailRecord = user.email;

      let r = await client.putThen('/account/' + user.accountId, user.account);
      respOkEmpty(r);

      r = await client.postThen(
        '/account/' + user.accountId + '/emails',
        user.email
      );
      respOkEmpty(r);

      r = await client.getThen('/account/' + user.accountId + '/emails');
      respOk(r);
      let result = r.obj;
      assert.lengthOf(result, 2);

      // Verify first email is the primary email
      assert.equal(
        result[0].email,
        user.account.email,
        'matches account email'
      );
      assert.equal(
        !!result[0].isPrimary,
        true,
        'isPrimary is true on account email'
      );
      assert.equal(
        !!result[0].isVerified,
        !!user.account.emailVerified,
        'matches account emailVerified'
      );

      // Verify second email is the secondary email
      assert.equal(
        result[1].email,
        secondEmailRecord.email,
        'matches secondEmail email'
      );
      assert.equal(
        !!result[1].isPrimary,
        false,
        'isPrimary is false on secondEmail email'
      );
      assert.equal(
        !!result[1].isVerified,
        false,
        'matches secondEmail isVerified'
      );

      var emailCodeHex = secondEmailRecord.emailCode.toString('hex');
      r = await client.postThen(
        '/account/' + user.accountId + '/verifyEmail/' + emailCodeHex
      );
      respOkEmpty(r);

      r = await client.getThen('/account/' + user.accountId + '/emails');
      respOk(r);

      result = r.obj;
      assert.lengthOf(result, 2);
      assert.equal(
        result[1].email,
        secondEmailRecord.email,
        'matches secondEmail email'
      );
      assert.equal(
        !!result[1].isPrimary,
        false,
        'isPrimary is false on secondEmail email'
      );
      assert.equal(
        !!result[1].isVerified,
        true,
        'matches secondEmail isVerified'
      );

      const thirdEmailRecord = fake.newUserDataHex().email;
      r = await client.postThen(
        '/account/' + user.accountId + '/emails',
        thirdEmailRecord
      );
      respOkEmpty(r);

      r = await client.getThen('/account/' + user.accountId + '/emails');
      respOk(r);

      result = r.obj;
      assert.lengthOf(result, 3);
      // Secondary emails are not returned in a deterministic order; normalize.
      if (result[2].email !== thirdEmailRecord.email) {
        assert.equal(
          result[2].email,
          secondEmailRecord.email,
          'second email record was returned third'
        );
        [result[1], result[2]] = [result[2], result[1]];
      }

      assert.equal(
        result[2].email,
        thirdEmailRecord.email,
        'matches thirdEmailRecord email'
      );
      assert.equal(
        !!result[2].isPrimary,
        false,
        'isPrimary is false on thirdEmailRecord email'
      );
      assert.equal(
        !!result[2].isVerified,
        false,
        'matches secondEmail thirdEmailRecord'
      );

      r = await client.delThen(
        '/account/' +
          user.accountId +
          '/emails/' +
          emailToHex(secondEmailRecord.email)
      );
      respOkEmpty(r);

      r = await client.getThen('/account/' + user.accountId + '/emails');
      respOk(r);

      result = r.obj;
      assert.lengthOf(result, 2);
      assert.equal(
        result[0].email,
        user.account.email,
        'matches account email'
      );
      assert.equal(
        !!result[0].isPrimary,
        true,
        'isPrimary is true on account email'
      );
      assert.equal(
        !!result[0].isVerified,
        !!user.account.emailVerified,
        'matches account emailVerified'
      );

      r = await client.getThen('/email/' + emailToHex(thirdEmailRecord.email));
      respOk(r);

      result = r.obj;
      assert.equal(result.email, thirdEmailRecord.email, 'matches email');
      assert.equal(!!result.isPrimary, false, 'isPrimary is false on email');
      assert.equal(
        !!result.isVerified,
        !!thirdEmailRecord.emailVerified,
        'matches emailVerified'
      );
    });

    it('add account, check password, retrieve it, delete it', () => {
      var user = fake.newUserDataHex();
      return client
        .putThen('/account/' + user.accountId, user.account)
        .then(function (r) {
          respOkEmpty(r);
          var randomPassword = Buffer.from(crypto.randomBytes(32)).toString(
            'hex'
          );
          return client
            .postThen('/account/' + user.accountId + '/checkPassword', {
              verifyHash: randomPassword,
            })
            .then(
              function (r) {
                assert(false, "should not be here, password isn't valid");
              },
              function (err) {
                assert(err, 'incorrect password produces an error');
                return client.postThen(
                  '/account/' + user.accountId + '/checkPassword',
                  { verifyHash: user.account.verifyHash }
                );
              }
            );
        })
        .then(function (r) {
          respOk(r);
          var account = r.obj;
          assert.equal(account.uid, user.accountId);
          return client.getThen('/account/' + user.accountId);
        })
        .then(function (r) {
          respOk(r);

          var account = r.obj;
          var fields = 'accountId,email,emailCode,kA,verifierVersion,authSalt'.split(
            ','
          );
          fields.forEach(function (f) {
            assert.equal(
              user.account[f],
              account[f],
              'Both Fields ' + f + ' are the same'
            );
          });
          assert.equal(
            user.account.emailVerified,
            !!account.emailVerified,
            'Both fields emailVerified are the same'
          );
          assert(!account.verifyHash, 'verifyHash field should be absent');
        })
        .then(function () {
          return client.headThen(
            '/emailRecord/' + emailToHex(user.account.email)
          );
        })
        .then(function (r) {
          respOkEmpty(r);
          return client.getThen(
            '/emailRecord/' + emailToHex(user.account.email)
          );
        })
        .then(function (r) {
          respOk(r);
          var account = r.obj;
          var fields = 'accountId,email,emailCode,kA,verifierVersion,authSalt'.split(
            ','
          );
          fields.forEach(function (f) {
            assert.equal(
              user.account[f],
              account[f],
              'Both Fields ' + f + ' are the same'
            );
          });
          assert.equal(
            user.account.emailVerified,
            !!account.emailVerified,
            'Both fields emailVerified are the same'
          );
          assert(!account.verifyHash, 'verifyHash field should be absent');
        })
        .then(function () {
          return client.delThen('/account/' + user.accountId);
        })
        .then(function (r) {
          respOk(r);
          // now make sure this record no longer exists
          return client
            .headThen('/emailRecord/' + emailToHex(user.account.email))
            .then(
              function (r) {
                assert(
                  false,
                  'Should not be here, since this account no longer exists'
                );
              },
              function (err) {
                assert.equal(
                  err.toString(),
                  'NotFoundError',
                  'Account not found (no body due to being a HEAD request'
                );
                assert.deepEqual(
                  err.body,
                  {},
                  'Body contains nothing since this is a HEAD request'
                );
                assert.deepEqual(err.statusCode, 404, 'Status Code is 404');
              }
            );
        });
    });

    it('session token handling', () => {
      var user = fake.newUserDataHex();
      var verifiedUser = fake.newUserDataHex();
      delete verifiedUser.sessionToken.tokenVerificationId;

      // Fetch all of the session tokens for the account
      return client
        .getThen('/account/' + user.accountId + '/sessions')
        .then(function (r) {
          respOk(r);
          assert.isArray(r.obj);
          assert.lengthOf(r.obj, 0);

          // Create accounts
          return P.all([
            client.putThen('/account/' + user.accountId, user.account),
            client.putThen(
              '/account/' + verifiedUser.accountId,
              verifiedUser.account
            ),
          ]);
        })
        .then(function () {
          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions');
        })
        .then(function (r) {
          assert.lengthOf(r.obj, 0);

          // Attempt to fetch a non-existent session token
          return client.getThen('/sessionToken/' + user.sessionTokenId).then(
            function () {
              assert(
                false,
                'A non-existent session token should not have returned anything'
              );
            },
            function (err) {
              testNotFound(err);
            }
          );
        })
        .then(function () {
          // Create a session token
          return client.putThen(
            '/sessionToken/' + user.sessionTokenId,
            user.sessionToken
          );
        })
        .then(function (r) {
          respOk(r);

          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions');
        })
        .then(function (r) {
          respOk(r);
          var sessions = r.obj;
          assert.lengthOf(sessions, 1);
          assert.equal(
            Object.keys(sessions[0]).length,
            20,
            'session has correct properties'
          );
          assert.equal(
            sessions[0].tokenId,
            user.sessionTokenId,
            'tokenId is correct'
          );
          assert.equal(sessions[0].uid, user.accountId, 'uid is correct');
          assert.equal(
            sessions[0].createdAt,
            user.sessionToken.createdAt,
            'createdAt is correct'
          );
          assert.equal(
            sessions[0].uaBrowser,
            user.sessionToken.uaBrowser,
            'uaBrowser is correct'
          );
          assert.equal(
            sessions[0].uaBrowserVersion,
            user.sessionToken.uaBrowserVersion,
            'uaBrowserVersion is correct'
          );
          assert.equal(
            sessions[0].uaOS,
            user.sessionToken.uaOS,
            'uaOS is correct'
          );
          assert.equal(
            sessions[0].uaOSVersion,
            user.sessionToken.uaOSVersion,
            'uaOSVersion is correct'
          );
          assert.equal(
            sessions[0].uaDeviceType,
            user.sessionToken.uaDeviceType,
            'uaDeviceType is correct'
          );
          assert.equal(
            sessions[0].uaFormFactor,
            user.sessionToken.uaFormFactor,
            'uaFormFactor is correct'
          );
          assert.equal(
            sessions[0].lastAccessTime,
            user.sessionToken.createdAt,
            'lastAccessTime is correct'
          );
          assert.equal(
            sessions[0].authAt,
            user.sessionToken.createdAt,
            'authAt is correct'
          );

          // Fetch the session token
          return client.getThen('/sessionToken/' + user.sessionTokenId);
        })
        .then(function (r) {
          var token = r.obj;

          assert.deepEqual(
            token.tokenData,
            user.sessionToken.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert.equal(
            token.createdAt,
            user.sessionToken.createdAt,
            'createdAt matches'
          );
          assert.equal(
            token.uaBrowser,
            user.sessionToken.uaBrowser,
            'uaBrowser matches'
          );
          assert.equal(
            token.uaBrowserVersion,
            user.sessionToken.uaBrowserVersion,
            'uaBrowserVersion matches'
          );
          assert.equal(token.uaOS, user.sessionToken.uaOS, 'uaOS matches');
          assert.equal(
            token.uaOSVersion,
            user.sessionToken.uaOSVersion,
            'uaOSVersion matches'
          );
          assert.equal(
            token.uaDeviceType,
            user.sessionToken.uaDeviceType,
            'uaDeviceType matches'
          );
          assert.equal(
            token.uaFormFactor,
            user.sessionToken.uaFormFactor,
            'uaFormFactor matches'
          );
          assert.equal(
            token.lastAccessTime,
            token.createdAt,
            'lastAccessTime was set'
          );
          assert.equal(
            token.authAt,
            token.createdAt,
            'authAt was set to default'
          );
          assert.equal(
            !!token.emailVerified,
            user.account.emailVerified,
            'emailVerified same as account emailVerified'
          );
          assert.equal(
            token.email,
            user.account.email,
            'token.email same as account email'
          );
          assert.deepEqual(
            token.emailCode,
            user.account.emailCode,
            'token emailCode same as account emailCode'
          );
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');
          assert.isAbove(token.accountCreatedAt, 0);
          assert.equal(
            token.mustVerify,
            user.sessionToken.mustVerify,
            'mustVerify is correct'
          );
          assert.equal(
            token.tokenVerificationId,
            user.sessionToken.tokenVerificationId,
            'tokenVerificationId is correct'
          );

          // Create a verified session token
          return client.putThen(
            '/sessionToken/' + verifiedUser.sessionTokenId,
            verifiedUser.sessionToken
          );
        })
        .then(function (r) {
          respOk(r);

          // Fetch the verified session token
          return client.getThen('/sessionToken/' + verifiedUser.sessionTokenId);
        })
        .then(function (r) {
          var token = r.obj;

          assert.deepEqual(
            token.tokenData,
            verifiedUser.sessionToken.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            verifiedUser.accountId,
            'token belongs to this account'
          );
          assert.equal(
            token.createdAt,
            verifiedUser.sessionToken.createdAt,
            'createdAt matches'
          );
          assert.equal(
            token.uaBrowser,
            verifiedUser.sessionToken.uaBrowser,
            'uaBrowser matches'
          );
          assert.equal(
            token.uaBrowserVersion,
            verifiedUser.sessionToken.uaBrowserVersion,
            'uaBrowserVersion matches'
          );
          assert.equal(
            token.uaOS,
            verifiedUser.sessionToken.uaOS,
            'uaOS matches'
          );
          assert.equal(
            token.uaOSVersion,
            verifiedUser.sessionToken.uaOSVersion,
            'uaOSVersion matches'
          );
          assert.equal(
            token.uaDeviceType,
            verifiedUser.sessionToken.uaDeviceType,
            'uaDeviceType matches'
          );
          assert.equal(
            token.uaFormFactor,
            verifiedUser.sessionToken.uaFormFactor,
            'uaFormFactor matches'
          );
          assert.equal(
            token.lastAccessTime,
            token.createdAt,
            'lastAccessTime was set'
          );
          assert.equal(
            token.authAt,
            token.createdAt,
            'authAt was set to default'
          );
          assert.equal(
            !!token.emailVerified,
            verifiedUser.account.emailVerified,
            'emailVerified same as account emailVerified'
          );
          assert.equal(
            token.email,
            verifiedUser.account.email,
            'token.email same as account email'
          );
          assert.deepEqual(
            token.emailCode,
            verifiedUser.account.emailCode,
            'token emailCode same as account emailCode'
          );
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');
          assert.isAbove(token.accountCreatedAt, 0);
          assert.isTrue(!!token.mustVerify);
          assert.isNull(token.tokenVerificationId);

          // Attempt to verify a non-existent session token
          return client
            .postThen(
              '/tokens/' + crypto.randomBytes(16).toString('hex') + '/verify',
              {
                uid: user.accountId,
              }
            )
            .then(
              function () {
                assert(false, 'Verifying a non-existent token should fail');
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          // Attempt to verify a session token with the wrong uid
          return client
            .postThen(
              '/tokens/' + user.sessionToken.tokenVerificationId + '/verify',
              {
                uid: crypto.randomBytes(16).toString('hex'),
              }
            )
            .then(
              function () {
                assert(false, 'Verifying a non-existent token should fail');
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          // Verify the unverified session token
          return client.postThen(
            '/tokens/' + user.sessionToken.tokenVerificationId + '/verify',
            {
              uid: user.accountId,
            }
          );
        })
        .then(function () {
          // Fetch the newly verified session token
          return client.getThen('/sessionToken/' + user.sessionTokenId);
        })
        .then(function (r) {
          assert.equal(!!r.obj.mustVerify, true, 'mustVerify is true');
          assert.isNull(r.obj.tokenVerificationId);

          // Attempt to verify the session token again
          return client
            .postThen(
              '/tokens/' + user.sessionToken.tokenVerificationId + '/verify',
              {
                uid: user.accountId,
              }
            )
            .then(
              function () {
                assert(false, 'Verifying a verified token should have failed');
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          // Update the newly verified session token
          return client.postThen(
            '/sessionToken/' + user.sessionTokenId + '/update',
            {
              uaBrowser: 'different browser',
              uaBrowserVersion: 'different browser version',
              uaOS: 'different OS',
              uaOSVersion: 'different OS version',
              uaDeviceType: 'different device type',
              lastAccessTime: 42,
              authAt: 1234567,
            }
          );
        })
        .then(function (r) {
          respOk(r);

          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions');
        })
        .then(function (r) {
          respOk(r);
          var sessions = r.obj;
          assert.lengthOf(sessions, 1);
          assert.equal(
            sessions[0].tokenId,
            user.sessionTokenId,
            'tokenId is correct'
          );
          assert.equal(sessions[0].uid, user.accountId, 'uid is correct');
          assert.equal(
            sessions[0].createdAt,
            user.sessionToken.createdAt,
            'createdAt is correct'
          );
          assert.equal(
            sessions[0].uaBrowser,
            'different browser',
            'uaBrowser is correct'
          );
          assert.equal(
            sessions[0].uaBrowserVersion,
            'different browser version',
            'uaBrowserVersion is correct'
          );
          assert.equal(sessions[0].uaOS, 'different OS', 'uaOS is correct');
          assert.equal(
            sessions[0].uaOSVersion,
            'different OS version',
            'uaOSVersion is correct'
          );
          assert.equal(
            sessions[0].uaDeviceType,
            'different device type',
            'uaDeviceType is correct'
          );
          assert.equal(
            sessions[0].lastAccessTime,
            42,
            'lastAccessTime is correct'
          );
          assert.equal(sessions[0].authAt, 1234567, 'authAt is correct');

          // Fetch the newly verified session token
          return client.getThen('/sessionToken/' + user.sessionTokenId);
        })
        .then(function (r) {
          var token = r.obj;

          assert.deepEqual(
            token.tokenData,
            user.sessionToken.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert.equal(
            token.createdAt,
            user.sessionToken.createdAt,
            'createdAt was not updated'
          );
          assert.equal(
            token.uaBrowser,
            'different browser',
            'uaBrowser was updated'
          );
          assert.equal(
            token.uaBrowserVersion,
            'different browser version',
            'uaBrowserVersion was updated'
          );
          assert.equal(token.uaOS, 'different OS', 'uaOS was updated');
          assert.equal(
            token.uaOSVersion,
            'different OS version',
            'uaOSVersion was updated'
          );
          assert.equal(
            token.uaDeviceType,
            'different device type',
            'uaDeviceType was updated'
          );
          assert.equal(token.lastAccessTime, 42, 'lastAccessTime was updated');
          assert.equal(token.authAt, 1234567, 'authAt was updated');

          // Create a device
          return client.putThen(
            '/account/' + user.accountId + '/device/' + user.deviceId,
            user.device
          );
        })
        .then(function (r) {
          respOk(r);

          // Fetch devices for the account
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          assert.lengthOf(r.obj, 1);

          // Fetch the session again to make sure device info is included
          return client.getThen('/account/' + user.accountId + '/sessions');
        })
        .then(function (r) {
          respOk(r);
          var sessions = r.obj;
          assert.lengthOf(sessions, 1);
          var s = sessions[0];
          assert(s.createdAt);
          assert.equal(s.deviceCallbackAuthKey.length, 22);
          assert(s.deviceCallbackPublicKey);
          assert.equal(s.deviceCallbackURL, 'fake callback URL');
          assert.equal(s.deviceCallbackIsExpired, false);
          assert(s.deviceCreatedAt);
          assert(s.deviceId);
          assert.equal(s.deviceName, 'fake device name');
          assert.equal(s.deviceType, 'fake device type');
          assert(s.lastAccessTime);
          assert(s.tokenId);
          assert(s.uaBrowser);
          assert(s.uaBrowserVersion);
          assert(s.uaDeviceType);
          assert(s.uaFormFactor);
          assert(s.uaOS);
          assert(s.uaOSVersion);
          assert(s.uid);
          // Delete both session tokens
          return P.all([
            client.delThen('/sessionToken/' + user.sessionTokenId),
            client.delThen('/sessionToken/' + verifiedUser.sessionTokenId),
          ]);
        })
        .then(function (results) {
          assert.lengthOf(results, 2);
          results.forEach(function (result) {
            respOk(result);
          });

          // Fetch devices for the account
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          assert.lengthOf(r.obj, 0);

          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions');
        })
        .then(function (r) {
          respOk(r);
          assert.lengthOf(r.obj, 0);

          // Attempt to fetch a deleted session token
          return client.getThen('/sessionToken/' + user.sessionTokenId).then(
            () =>
              assert(
                false,
                'Fetching the non-existant sessionToken should have failed'
              ),
            (err) => testNotFound(err)
          );
        });
    });

    it('device handling', () => {
      const user = fake.newUserDataHex();
      const zombieUser = fake.newUserDataHex();
      return client
        .getThen('/account/' + user.accountId + '/devices')
        .then(function (r) {
          respOk(r);
          assert.isArray(r.obj);
          assert.lengthOf(r.obj, 0);
          return client.putThen('/account/' + user.accountId, user.account);
        })
        .then(function () {
          return client.putThen(
            '/sessionToken/' + user.sessionTokenId,
            user.sessionToken
          );
        })
        .then(function () {
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          assert.lengthOf(r.obj, 0);
          return client.putThen(
            '/account/' + user.accountId + '/device/' + user.deviceId,
            user.device
          );
        })
        .then(function (r) {
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 1);
          assert.lengthOf(Object.keys(devices[0]), 19);
          assert.equal(devices[0].uid, user.accountId, 'uid is correct');
          assert.equal(devices[0].id, user.deviceId, 'id is correct');
          assert.equal(
            devices[0].sessionTokenId,
            user.sessionTokenId,
            'sessionTokenId is correct'
          );
          assert.equal(
            devices[0].refreshTokenId,
            null,
            'refreshTokenId is correct'
          );
          assert.equal(
            devices[0].createdAt,
            user.device.createdAt,
            'createdAt is correct'
          );
          assert.equal(devices[0].name, user.device.name, 'name is correct');
          assert.equal(devices[0].type, user.device.type, 'type is correct');
          assert.equal(
            devices[0].callbackURL,
            user.device.callbackURL,
            'callbackURL is correct'
          );
          assert.equal(
            devices[0].callbackPublicKey,
            user.device.callbackPublicKey,
            'callbackPublicKey is correct'
          );
          assert.equal(
            devices[0].callbackAuthKey,
            user.device.callbackAuthKey,
            'callbackAuthKey is correct'
          );
          assert.equal(
            devices[0].callbackIsExpired,
            user.device.callbackIsExpired,
            'callbackIsExpired is correct'
          );
          assert.deepEqual(
            devices[0].availableCommands,
            {},
            'availableCommands is correct'
          );
          assert.equal(
            devices[0].uaBrowser,
            user.sessionToken.uaBrowser,
            'uaBrowser is correct'
          );
          assert.equal(
            devices[0].uaBrowserVersion,
            user.sessionToken.uaBrowserVersion,
            'uaBrowserVersion is correct'
          );
          assert.equal(
            devices[0].uaOS,
            user.sessionToken.uaOS,
            'uaOS is correct'
          );
          assert.equal(
            devices[0].uaOSVersion,
            user.sessionToken.uaOSVersion,
            'uaOSVersion is correct'
          );
          assert.equal(
            devices[0].uaDeviceType,
            user.sessionToken.uaDeviceType,
            'uaDeviceType is correct'
          );
          assert.equal(
            devices[0].uaFormFactor,
            user.sessionToken.uaFormFactor,
            'uaFormFactor is correct'
          );
          assert.equal(
            devices[0].lastAccessTime,
            user.sessionToken.createdAt,
            'lastAccessTime is correct'
          );
        })
        .then(function () {
          return client.getThen(
            '/account/' + user.accountId + '/device/' + user.deviceId
          );
        })
        .then(function (r) {
          respOk(r);
          var device = r.obj;
          assert.equal(device.id, user.deviceId, 'id is correct');
          assert.equal(
            device.createdAt,
            user.device.createdAt,
            'createdAt is correct'
          );
          assert.equal(device.name, user.device.name, 'name is correct');
          assert.equal(device.type, user.device.type, 'type is correct');
          assert.equal(
            device.callbackURL,
            user.device.callbackURL,
            'callbackURL is correct'
          );
          assert.equal(
            device.callbackPublicKey,
            user.device.callbackPublicKey,
            'callbackPublicKey is correct'
          );
          assert.equal(
            device.callbackAuthKey,
            user.device.callbackAuthKey,
            'callbackAuthKey is correct'
          );
          assert.equal(
            device.callbackIsExpired,
            user.device.callbackIsExpired,
            'callbackIsExpired is correct'
          );
          assert.deepEqual(
            device.availableCommands,
            {},
            'availableCommands is correct'
          );
        })
        .then(function () {
          return client.getThen(
            '/account/' +
              user.accountId +
              '/tokens/' +
              user.sessionToken.tokenVerificationId +
              '/device'
          );
        })
        .then(function (r) {
          respOk(r);
          var device = r.obj;
          assert.equal(device.id, user.deviceId, 'id is correct');
          assert.equal(
            device.createdAt,
            user.device.createdAt,
            'createdAt is correct'
          );
          assert.equal(device.name, user.device.name, 'name is correct');
          assert.equal(device.type, user.device.type, 'type is correct');
          assert.equal(
            device.callbackURL,
            user.device.callbackURL,
            'callbackURL is correct'
          );
          assert.equal(
            device.callbackPublicKey,
            user.device.callbackPublicKey,
            'callbackPublicKey is correct'
          );
          assert.equal(
            device.callbackAuthKey,
            user.device.callbackAuthKey,
            'callbackAuthKey is correct'
          );
          assert.equal(
            device.callbackIsExpired,
            user.device.callbackIsExpired,
            'callbackIsExpired is correct'
          );
          assert.deepEqual(
            device.availableCommands,
            {},
            'availableCommands is correct'
          );

          return client.postThen(
            '/account/' +
              user.accountId +
              '/device/' +
              user.deviceId +
              '/update',
            {
              name: 'wibble',
              type: 'mobile',
              callbackURL: '',
              callbackPublicKey: null,
              callbackAuthKey: null,
              callbackIsExpired: null,
              availableCommands: {},
            }
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 1);
          assert.equal(devices[0].uid, user.accountId, 'uid is correct');
          assert.equal(devices[0].id, user.deviceId, 'id is correct');
          assert.equal(
            devices[0].sessionTokenId,
            user.sessionTokenId,
            'sessionTokenId is correct'
          );
          assert.equal(
            devices[0].createdAt,
            user.device.createdAt,
            'createdAt is correct'
          );
          assert.equal(devices[0].name, 'wibble', 'name is correct');
          assert.equal(devices[0].type, 'mobile', 'type is correct');
          assert.equal(devices[0].callbackURL, '', 'callbackURL is correct');
          assert.equal(
            devices[0].callbackPublicKey,
            user.device.callbackPublicKey,
            'callbackPublicKey is correct'
          );
          assert.equal(
            devices[0].callbackAuthKey,
            user.device.callbackAuthKey,
            'callbackAuthKey is correct'
          );
          assert.equal(
            devices[0].callbackIsExpired,
            false,
            'callbackIsExpired is correct'
          );
          assert.deepEqual(
            devices[0].availableCommands,
            {},
            'availableCommands is correct'
          );
          assert.equal(
            devices[0].uaBrowser,
            user.sessionToken.uaBrowser,
            'uaBrowser is correct'
          );
          assert.equal(
            devices[0].uaBrowserVersion,
            user.sessionToken.uaBrowserVersion,
            'uaBrowserVersion is correct'
          );
          assert.equal(
            devices[0].uaOS,
            user.sessionToken.uaOS,
            'uaOS is correct'
          );
          assert.equal(
            devices[0].uaOSVersion,
            user.sessionToken.uaOSVersion,
            'uaOSVersion is correct'
          );
          assert.equal(
            devices[0].uaDeviceType,
            user.sessionToken.uaDeviceType,
            'uaDeviceType is correct'
          );
          assert.equal(
            devices[0].uaFormFactor,
            user.sessionToken.uaFormFactor,
            'uaFormFactor is correct'
          );
          assert.equal(
            devices[0].lastAccessTime,
            user.sessionToken.createdAt,
            'lastAccessTime is correct'
          );

          return client.postThen(
            '/account/' +
              user.accountId +
              '/device/' +
              user.deviceId +
              '/update',
            {
              sessionTokenId: zombieUser.sessionTokenId,
            }
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 0);

          return client.postThen(
            '/account/' +
              user.accountId +
              '/device/' +
              user.deviceId +
              '/update',
            {
              sessionTokenId: user.sessionTokenId,
            }
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 1);

          return client.postThen(
            '/account/' +
              user.accountId +
              '/device/' +
              user.deviceId +
              '/update',
            {
              name: '4a6f686e',
            }
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 1);
          assert.equal(
            devices[0].name,
            '4a6f686e',
            'name was not automagically bufferized'
          );

          return client.putThen(
            '/account/' + user.accountId + '/device/' + user.oauthDeviceId,
            user.oauthDevice
          );
        })
        .then(function (r) {
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 2);
          const sessionDevice = devices.find((d) => d.sessionTokenId);
          const oauthDevice = devices.find((d) => d.refreshTokenId);

          assert.equal(sessionDevice.uid, user.accountId, 'uid is correct');
          assert.equal(
            sessionDevice.sessionTokenId,
            user.sessionTokenId,
            'sessionTokenId is correct'
          );
          assert.equal(
            sessionDevice.refreshTokenId,
            null,
            'refreshTokenId is correct'
          );

          assert.lengthOf(Object.keys(oauthDevice), 19);
          assert.equal(oauthDevice.uid, user.accountId, 'uid is correct');
          assert.equal(oauthDevice.id, user.oauthDeviceId, 'id is correct');
          assert.equal(
            oauthDevice.sessionTokenId,
            null,
            'sessionTokenId is correct'
          );
          assert.equal(
            oauthDevice.refreshTokenId,
            user.refreshTokenId,
            'refreshTokenId is correct'
          );
          assert.equal(
            oauthDevice.createdAt,
            user.oauthDevice.createdAt,
            'createdAt is correct'
          );
          assert.equal(
            oauthDevice.name,
            user.oauthDevice.name,
            'name is correct'
          );
          assert.equal(
            oauthDevice.type,
            user.oauthDevice.type,
            'type is correct'
          );
          assert.equal(
            oauthDevice.callbackURL,
            user.oauthDevice.callbackURL,
            'callbackURL is correct'
          );
          assert.equal(
            oauthDevice.callbackPublicKey,
            user.oauthDevice.callbackPublicKey,
            'callbackPublicKey is correct'
          );
          assert.equal(
            oauthDevice.callbackAuthKey,
            user.oauthDevice.callbackAuthKey,
            'callbackAuthKey is correct'
          );
          assert.equal(
            oauthDevice.callbackIsExpired,
            user.oauthDevice.callbackIsExpired,
            'callbackIsExpired is correct'
          );
          assert.deepEqual(
            oauthDevice.availableCommands,
            {},
            'availableCommands is correct'
          );
          assert.isNull(oauthDevice.uaBrowser);
          assert.isNull(oauthDevice.uaBrowserVersion);
          assert.isNull(oauthDevice.uaOS);
          assert.isNull(oauthDevice.uaOSVersion);
          assert.isNull(oauthDevice.uaDeviceType);
          assert.isNull(oauthDevice.uaFormFactor);
          assert.isNull(oauthDevice.lastAccessTime);

          return client.postThen(
            '/account/' +
              user.accountId +
              '/device/' +
              oauthDevice.id +
              '/update',
            {
              name: 'a new device name',
            }
          );
        })
        .then(function (r) {
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          var devices = r.obj;
          assert.lengthOf(devices, 2);
          const sessionDevice = devices.find((d) => d.sessionTokenId);
          const oauthDevice = devices.find((d) => d.refreshTokenId);

          assert.equal(
            sessionDevice.sessionTokenId,
            user.sessionTokenId,
            'sessionTokenId is correct'
          );
          assert.isNull(sessionDevice.refreshTokenId);

          assert.isNull(oauthDevice.sessionTokenId);
          assert.equal(
            oauthDevice.refreshTokenId,
            oauthDevice.refreshTokenId,
            'refreshTokenId is correct'
          );
          assert.equal(
            oauthDevice.name,
            'a new device name',
            'name is correct'
          );

          return client.delThen(
            '/account/' + user.accountId + '/device/' + user.oauthDeviceId
          );
        })
        .then(function (r) {
          respOk(r);
          assert.deepEqual(r.obj, {
            sessionTokenId: null,
            refreshTokenId: user.refreshTokenId,
          });

          return client.delThen(
            '/account/' + user.accountId + '/device/' + user.deviceId
          );
        })
        .then(function (r) {
          respOk(r);
          assert.deepEqual(r.obj, {
            sessionTokenId: user.sessionTokenId,
            refreshTokenId: null,
          });
          return client.getThen('/account/' + user.accountId + '/devices');
        })
        .then(function (r) {
          respOk(r);
          assert.lengthOf(r.obj, 0);

          return client
            .getThen('/account/' + user.accountId + '/device' + user.deviceId)
            .then(
              function () {
                assert(
                  false,
                  'A non-existent deviceId should not have returned anything'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        });
    });

    it('key fetch token handling', () => {
      var user = fake.newUserDataHex();
      user.sessionToken.tokenVerificationId =
        user.keyFetchToken.tokenVerificationId;
      var verifiedUser = fake.newUserDataHex();
      delete verifiedUser.keyFetchToken.tokenVerificationId;

      // Create accounts
      return P.all([
        client.putThen('/account/' + user.accountId, user.account),
        client.putThen(
          '/account/' + verifiedUser.accountId,
          verifiedUser.account
        ),
      ])
        .then(function () {
          // Attempt to fetch a non-existent key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId).then(
            function () {
              assert(
                false,
                'A non-existent keyFetchToken should not have returned anything'
              );
            },
            function (err) {
              testNotFound(err);
            }
          );
        })
        .then(function () {
          // Attempt to fetch a non-existent key fetch token with its verification state
          return client
            .getThen('/keyFetchToken/' + user.keyFetchTokenId + '/verified')
            .then(
              function () {
                assert(
                  false,
                  'A non-existent keyFetchToken should not have returned anything'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          // Create a session token and a key fetch token
          return P.all([
            client.putThen(
              '/sessionToken/' + user.sessionTokenId,
              user.sessionToken
            ),
            client.putThen(
              '/keyFetchToken/' + user.keyFetchTokenId,
              user.keyFetchToken
            ),
          ]);
        })
        .then(function (r) {
          respOk(r[0]);
          respOk(r[1]);

          // Fetch the key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId);
        })
        .then(function (r) {
          var token = r.obj;

          // tokenId is not returned from db.keyFetchToken()
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert.deepEqual(
            token.authKey,
            user.keyFetchToken.authKey,
            'authKey matches'
          );
          assert.deepEqual(
            token.keyBundle,
            user.keyFetchToken.keyBundle,
            'keyBundle matches'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert.equal(!!token.emailVerified, user.account.emailVerified);
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');
          assert.isUndefined(token.tokenVerificationId);

          // Fetch the key fetch token with its verification state
          return client.getThen(
            '/keyFetchToken/' + user.keyFetchTokenId + '/verified'
          );
        })
        .then(function (r) {
          var token = r.obj;

          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert.deepEqual(
            token.authKey,
            user.keyFetchToken.authKey,
            'authKey matches'
          );
          assert.deepEqual(
            token.keyBundle,
            user.keyFetchToken.keyBundle,
            'keyBundle matches'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert.equal(!!token.emailVerified, user.account.emailVerified);
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');
          assert.equal(
            token.tokenVerificationId,
            user.keyFetchToken.tokenVerificationId,
            'tokenVerificationId is correct'
          );

          // Fetch the session token with its verification state
          return client.getThen('/sessionToken/' + user.sessionTokenId);
        })
        .then(function (r) {
          assert.equal(
            r.obj.tokenVerificationId,
            user.sessionToken.tokenVerificationId,
            'tokenVerificationId is correct'
          );

          // Attempt to verify a non-existent key fetch token
          return client
            .postThen(
              '/tokens/' + crypto.randomBytes(16).toString('hex') + '/verify',
              {
                uid: user.accountId,
              }
            )
            .then(
              function () {
                assert(false, 'Verifying a non-existent token should fail');
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function (r) {
          // Attempt to verify a key fetch token with the wrong uid
          return client
            .postThen(
              '/tokens/' + user.keyFetchToken.tokenVerificationId + '/verify',
              {
                uid: crypto.randomBytes(16).toString('hex'),
              }
            )
            .then(
              function () {
                assert(false, 'Verifying a non-existent token should fail');
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function (r) {
          // Verify the key fetch token
          return client.postThen(
            '/tokens/' + user.keyFetchToken.tokenVerificationId + '/verify',
            {
              uid: user.accountId,
            }
          );
        })
        .then(function () {
          // Fetch the key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId);
        })
        .then(function (r) {
          assert.isUndefined(r.obj.tokenVerificationId);

          // Fetch the key fetch token with its verification state
          return client.getThen(
            '/keyFetchToken/' + user.keyFetchTokenId + '/verified'
          );
        })
        .then(function (r) {
          assert.isNull(r.obj.tokenVerificationId);

          // Fetch the session token with its verification state
          return client.getThen('/sessionToken/' + user.sessionTokenId);
        })
        .then(function (r) {
          assert.isNull(r.obj.tokenVerificationId);

          // Attempt to verify the key fetch token again
          return client
            .postThen(
              '/tokens/' + user.keyFetchToken.tokenVerificationId + '/verify',
              {
                uid: user.accountId,
              }
            )
            .then(
              function () {
                assert(false, 'Verifying a verified token should have failed');
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          // Create a verified key fetch token
          return client.putThen(
            '/keyFetchToken/' + verifiedUser.keyFetchTokenId,
            verifiedUser.keyFetchToken
          );
        })
        .then(function () {
          // Fetch the verified key fetch token
          return client.getThen(
            '/keyFetchToken/' + verifiedUser.keyFetchTokenId
          );
        })
        .then(function (r) {
          assert.isUndefined(r.obj.tokenVerificationId);

          // Fetch the verified key fetch token with its verification state
          return client.getThen(
            '/keyFetchToken/' + verifiedUser.keyFetchTokenId + '/verified'
          );
        })
        .then(function (r) {
          assert.isNull(r.obj.tokenVerificationId);
          // Delete both key fetch tokens
          return P.all([
            client.delThen('/keyFetchToken/' + user.keyFetchTokenId),
            client.delThen('/keyFetchToken/' + verifiedUser.keyFetchTokenId),
          ]);
        })
        .then(function (results) {
          assert.lengthOf(results, 2);
          results.forEach(function (result) {
            respOk(result);
          });

          // Attempt to fetch a deleted key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId).then(
            function () {
              assert(
                false,
                'Fetching the non-existant keyFetchToken should have failed'
              );
            },
            function (err) {
              testNotFound(err);
            }
          );
        });
    });

    it('account reset token handling', () => {
      var user = fake.newUserDataHex();
      return client
        .putThen('/account/' + user.accountId, user.account)
        .then(function () {
          return client
            .getThen('/accountResetToken/' + user.accountResetTokenId)
            .then(
              function () {
                assert(
                  false,
                  'A non-existant session token should not have returned anything'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          return client.putThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId,
            user.passwordForgotToken
          );
        })
        .then(function (r) {
          respOk(r);
          // now, verify the password (which inserts the accountResetToken)
          return client.postThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId + '/verified',
            user.accountResetToken
          );
        })
        .then(function (r) {
          respOk(r);
          // check the accountResetToken exists
          return client.getThen(
            '/accountResetToken/' + user.accountResetTokenId
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen(
            '/accountResetToken/' + user.accountResetTokenId
          );
        })
        .then(function (r) {
          var token = r.obj;

          // tokenId is not returned from db.accountResetToken()
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert.deepEqual(
            token.tokenData,
            user.accountResetToken.data,
            'token data matches'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');

          // now delete it
          return client.delThen(
            '/accountResetToken/' + user.accountResetTokenId
          );
        })
        .then(function (r) {
          respOk(r);
          // now make sure the token no longer exists
          return client
            .getThen('/accountResetToken/' + user.accountResetTokenId)
            .then(
              function () {
                assert(
                  false,
                  'Fetching the non-existant accountResetToken should have failed'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        });
    });

    it('password change token handling', () => {
      var user = fake.newUserDataHex();
      return client
        .putThen('/account/' + user.accountId, user.account)
        .then(function () {
          return client
            .getThen('/passwordChangeToken/' + user.passwordChangeTokenId)
            .then(
              function () {
                assert(
                  false,
                  'A non-existant session token should not have returned anything'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function (r) {
          return client.putThen(
            '/passwordChangeToken/' + user.passwordChangeTokenId,
            user.passwordChangeToken
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen(
            '/passwordChangeToken/' + user.passwordChangeTokenId
          );
        })
        .then(function (r) {
          var token = r.obj;

          // tokenId is not returned from db.passwordChangeToken()
          assert.deepEqual(
            token.tokenData,
            user.passwordChangeToken.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');

          // now delete it
          return client.delThen(
            '/passwordChangeToken/' + user.passwordChangeTokenId
          );
        })
        .then(function (r) {
          respOk(r);
          // now make sure the token no longer exists
          return client
            .getThen('/passwordChangeToken/' + user.passwordChangeTokenId)
            .then(
              function () {
                assert(
                  false,
                  'Fetching the non-existant passwordChangeToken should have failed'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        });
    });

    it('password forgot token handling', () => {
      var user = fake.newUserDataHex();
      return client
        .putThen('/account/' + user.accountId, user.account)
        .then(function () {
          return client
            .getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
            .then(
              function () {
                assert(
                  false,
                  'A non-existant session token should not have returned anything'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          return client.putThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId,
            user.passwordForgotToken
          );
        })
        .then(function (r) {
          respOk(r);
          return client.getThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId
          );
        })
        .then(function (r) {
          var token = r.obj;

          // tokenId is not returned from db.passwordForgotToken()
          assert.deepEqual(
            token.tokenData,
            user.passwordForgotToken.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert.deepEqual(token.passCode, user.passwordForgotToken.passCode);
          assert.equal(
            token.tries,
            user.passwordForgotToken.tries,
            'Tries is correct'
          );
          assert.equal(token.email, user.account.email);
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');

          // now update this token (with extra tries)
          user.passwordForgotToken.tries += 1;
          return client.postThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId + '/update',
            user.passwordForgotToken
          );
        })
        .then(function (r) {
          respOk(r);

          // re-fetch this token
          return client.getThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId
          );
        })
        .then(function (r) {
          var token = r.obj;

          // tokenId is not returned from db.passwordForgotToken()
          assert.deepEqual(
            token.tokenData,
            user.passwordForgotToken.data,
            'token data matches'
          );
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert.deepEqual(token.passCode, user.passwordForgotToken.passCode);
          assert.equal(
            token.tries,
            user.passwordForgotToken.tries,
            'Tries is correct (now incremented)'
          );
          assert.equal(token.email, user.account.email);
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');

          // now delete it
          return client.delThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId
          );
        })
        .then(function (r) {
          respOk(r);
          // now make sure the token no longer exists
          return client
            .getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
            .then(
              function () {
                assert(
                  false,
                  'Fetching the non-existant passwordForgotToken should have failed'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        });
    });

    it('password forgot token verified', () => {
      var user = fake.newUserDataHex();
      return client
        .putThen('/account/' + user.accountId, user.account)
        .then(function (r) {
          respOk(r);
          return client.putThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId,
            user.passwordForgotToken
          );
        })
        .then(function (r) {
          respOk(r);
          // now, verify the password (which inserts the accountResetToken)
          return client.postThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId + '/verified',
            user.accountResetToken
          );
        })
        .then(function (r) {
          respOk(r);
          // check the accountResetToken exists
          return client.getThen(
            '/accountResetToken/' + user.accountResetTokenId
          );
        })
        .then(function (r) {
          var token = r.obj;

          // tokenId is not returned from db.accountResetToken()
          assert.deepEqual(
            token.uid,
            user.accountId,
            'token belongs to this account'
          );
          assert.deepEqual(
            token.tokenData,
            user.accountResetToken.data,
            'token data matches'
          );
          assert(token.createdAt, 'Got a createdAt');
          assert(token.verifierSetAt, 'verifierSetAt is set to a truthy value');

          // make sure then passwordForgotToken no longer exists
          return client
            .getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
            .then(
              function () {
                assert(
                  false,
                  'Fetching the non-existant passwordForgotToken should have failed'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        })
        .then(function () {
          //check that the account has been verified
          return client.getThen(
            '/emailRecord/' + emailToHex(user.account.email)
          );
        })
        .then(function (r) {
          respOk(r);
          var account = r.obj;
          assert.equal(
            true,
            !!account.emailVerified,
            'emailVerified is now true'
          );
        });
    });

    it('locale', () => {
      var user = fake.newUserDataHex();
      return client
        .putThen('/account/' + user.accountId, user.account)
        .then(function (r) {
          respOk(r);
          return client.putThen(
            '/sessionToken/' + user.sessionTokenId,
            user.sessionToken
          );
        })
        .then(function (r) {
          respOk(r);
          return client.postThen('/account/' + user.accountId + '/locale', {
            locale: 'en-US',
          });
        })
        .then(function (r) {
          respOk(r);
          return client.getThen('/sessionToken/' + user.sessionTokenId);
        })
        .then(function (r) {
          respOk(r);
          assert.equal('en-US', r.obj.locale, 'locale was set properly');
        });
    });

    it('unblock codes', () => {
      var user = fake.newUserDataHex();
      var uid = user.accountId;
      var unblockCode = crypto.randomBytes(4).toString('hex');
      return client
        .putThen('/account/' + uid + '/unblock/' + unblockCode)
        .then(function (r) {
          respOkEmpty(r);
          return client.delThen('/account/' + uid + '/unblock/' + unblockCode);
        })
        .then(function (r) {
          respOk(r);
          assert.isAtMost(r.obj.createdAt, Date.now());
          return client
            .delThen('/account/' + uid + '/unblock/' + unblockCode)
            .then(
              function (r) {
                assert(
                  false,
                  'This request should have failed (instead it suceeded)'
                );
              },
              function (err) {
                testNotFound(err);
              }
            );
        });
    });

    it('email bounces', () => {
      var email = Math.random() + '@email.bounces';
      return client
        .postThen('/emailBounces', {
          email: email,
          bounceType: 'Permanent',
          bounceSubType: 'NoEmail',
        })
        .then(function (r) {
          respOkEmpty(r);
          return client.getThen(
            '/emailBounces/' + Buffer.from(email).toString('hex')
          );
        })
        .then(function (r) {
          respOk(r);
          assert.lengthOf(r.obj, 1);
          assert.equal(r.obj[0].email, email);
          assert.isAtMost(r.obj[0].createdAt, Date.now());
        });
    });

    it('sign-in codes', () => {
      const user = fake.newUserDataHex();
      const now = Date.now();
      const signinCode = crypto.randomBytes(6).toString('hex');
      const flowId = crypto.randomBytes(32).toString('hex');
      const goodTimestamp = now - 1;
      const badTimestamp = now - cfg.signinCodesMaxAge - 1;

      // Create an account
      return client
        .putThen(`/account/${user.accountId}`, user.account)
        .then(() => {
          // Create a sign-in code
          return client.putThen(`/signinCodes/${signinCode}`, {
            uid: user.accountId,
            createdAt: goodTimestamp,
            flowId,
          });
        })
        .then((r) => {
          respOkEmpty(r);

          // Attempt to create a duplicate sign-in code
          return client
            .putThen(`/signinCodes/${signinCode}`, {
              uid: user.accountId,
              createdAt: goodTimestamp,
              flowId: crypto.randomBytes(32).toString('hex'),
            })
            .then(
              () =>
                assert(false, 'creating a duplicate sign-in code should fail'),
              (err) => testConflict(err)
            );
        })
        .then(() => {
          // Consume the sign-in code
          return client.postThen(`/signinCodes/${signinCode}/consume`);
        })
        .then((r) => {
          respOk(r);
          assert.deepEqual(
            r.obj,
            {
              email: user.account.email,
              flowId,
            },
            'consuming a sign-in code should return the email address and flowId'
          );

          // Attempt to consume the sign-in code again
          return client.postThen(`/signinCodes/${signinCode}/consume`).then(
            () =>
              assert(false, 'consuming a consumed sign-in code should fail'),
            (err) => testNotFound(err)
          );
        })
        .then(() => {
          // Create an expired sign-in code
          return client.putThen(`/signinCodes/${signinCode}`, {
            uid: user.accountId,
            createdAt: badTimestamp,
          });
        })
        .then((r) => {
          respOkEmpty(r);

          // Attempt to consume the expired sign-in code
          return client.postThen(`/signinCodes/${signinCode}/consume`).then(
            () =>
              assert(false, 'consuming an expired sign-in code should fail'),
            (err) => testNotFound(err)
          );
        });
    });

    describe('reset account tokens', () => {
      let user;
      before(() => {
        user = fake.newUserDataHex();
        return client.putThen(`/account/${user.accountId}`, user.account);
      });

      it('should remove password forgot token', () => {
        return client
          .putThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId,
            user.passwordForgotToken
          )
          .then((r) => {
            respOk(r);
            return client.postThen(`/account/${user.accountId}/resetTokens`);
          })
          .then((r) => {
            respOk(r);
            return client
              .getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
              .then(
                () => {
                  assert(
                    false,
                    'This request should have failed (instead it succeeded)'
                  );
                },
                (err) => {
                  testNotFound(err);
                }
              );
          });
      });

      it('should remove password change token', () => {
        return client
          .putThen(
            '/passwordChangeToken/' + user.passwordChangeTokenId,
            user.passwordChangeToken
          )
          .then((r) => {
            respOk(r);
            return client.postThen(`/account/${user.accountId}/resetTokens`);
          })
          .then((r) => {
            respOk(r);
            return client
              .getThen('/passwordChangeToken/' + user.passwordChangeTokenId)
              .then(
                () => {
                  assert(
                    false,
                    'This request should have failed (instead it succeeded)'
                  );
                },
                (err) => {
                  testNotFound(err);
                }
              );
          });
      });

      it('should remove account reset token', () => {
        return client
          .putThen(
            '/passwordForgotToken/' + user.passwordForgotTokenId,
            user.passwordForgotToken
          )
          .then((r) => {
            respOk(r);
            // now, verify the password (which inserts the accountResetToken)
            return client.postThen(
              '/passwordForgotToken/' +
                user.passwordForgotTokenId +
                '/verified',
              user.accountResetToken
            );
          })
          .then(function (r) {
            respOk(r);
            // check the accountResetToken exists
            return client.getThen(
              '/accountResetToken/' + user.accountResetTokenId
            );
          })
          .then((r) => {
            respOk(r);
            return client.postThen(`/account/${user.accountId}/resetTokens`);
          })
          .then(function (r) {
            respOk(r);
            // check the accountResetToken exists
            return client
              .getThen('/accountResetToken/' + user.accountResetTokenId)
              .then(
                () => {
                  assert(
                    false,
                    'This request should have failed (instead it succeeded)'
                  );
                },
                (err) => {
                  testNotFound(err);
                }
              );
          });
      });
    });

    it('GET an unknown path', () => {
      var p = captureFailureEvent(server);
      return client
        .getThen('/foo')
        .then(
          function (r) {
            assert(
              false,
              'This request should have failed (instead it suceeded)'
            );
          },
          function (err) {
            testNotFound(err);
            return p;
          }
        )
        .then(function () {
          assert('server emitted a failure event');
        });
    });

    it('PUT an unknown path', () => {
      var p = captureFailureEvent(server);
      return client
        .putThen('/bar', {})
        .then(
          function (r) {
            assert(
              false,
              'This request should have failed (instead it suceeded)'
            );
          },
          function (err) {
            testNotFound(err);
            return p;
          }
        )
        .then(function () {
          assert('server emitted a failure event');
        });
    });

    it('POST an unknown path', () => {
      var p = captureFailureEvent(server);
      return client.postThen('/baz', {}).then(
        function (r) {
          assert(
            false,
            'This request should have failed (instead it suceeded)'
          );
        },
        function (err) {
          testNotFound(err);
          return p;
        }
      );
    });

    it('DELETE an unknown path', () => {
      var p = captureFailureEvent(server);
      return client.delThen('/qux').then(
        function (r) {
          assert(
            false,
            'This request should have failed (instead it suceeded)'
          );
        },
        function (err) {
          testNotFound(err);
          return p;
        }
      );
    });

    it('HEAD an unknown path', () => {
      var p = captureFailureEvent(server);
      return client.headThen('/wibble').then(
        function (r) {
          assert(
            false,
            'This request should have failed (instead it suceeded)'
          );
        },
        function (err) {
          assert.deepEqual(
            err.body,
            {},
            'Body is empty since this is a HEAD request'
          );
          return p;
        }
      );
    });

    it('rejection of invalid hex data', () => {
      var user = fake.newUserDataHex();
      user.account.kA = 'invalid-hex-data';
      return client.putThen('/account/' + user.accountId, user.account).then(
        function () {
          assert(false, 'Invalid hex data should cause the request to fail');
        },
        function (err) {
          assert.equal(err.statusCode, 400, 'returns a 400');
        }
      );
    });

    describe('add account, add email, change email', () => {
      let user, secondEmailRecord;

      before(() => {
        user = fake.newUserDataHex();
        secondEmailRecord = user.email;

        // Create account
        return client
          .putThen('/account/' + user.accountId, user.account)
          .then(function (r) {
            respOkEmpty(r);
            // Create secondary email
            return client.postThen(
              '/account/' + user.accountId + '/emails',
              user.email
            );
          })
          .then(function (r) {
            respOk(r);
            const emailCodeHex = secondEmailRecord.emailCode.toString('hex');
            // Verify secondary email
            return client.postThen(
              '/account/' + user.accountId + '/verifyEmail/' + emailCodeHex
            );
          })
          .then(function (r) {
            respOkEmpty(r);
            return client.getThen('/account/' + user.accountId + '/emails');
          })
          .then(function (r) {
            respOk(r);
            const result = r.obj;
            assert.equal(
              result[0].email,
              user.account.email,
              'matches account email'
            );
            assert.equal(
              !!result[0].isPrimary,
              true,
              'isPrimary is true on account email'
            );
            assert.equal(
              !!result[0].isVerified,
              !!user.account.emailVerified,
              'matches account emailVerified'
            );

            assert.equal(
              result[1].email,
              secondEmailRecord.email,
              'matches secondEmail email'
            );
            assert.equal(
              !!result[1].isPrimary,
              false,
              'isPrimary is false on secondEmail email'
            );
            assert.equal(
              !!result[1].isVerified,
              true,
              'matches secondEmail isVerified'
            );
          });
      });

      it('should change email', () => {
        return client
          .postThen(
            '/email/' +
              emailToHex(secondEmailRecord.email) +
              '/account/' +
              user.accountId
          )
          .then((r) => {
            respOkEmpty(r);
            return client.getThen('/account/' + user.accountId + '/emails');
          })
          .then(function (r) {
            respOk(r);
            const result = r.obj;

            assert.equal(
              result[0].email,
              secondEmailRecord.email,
              'matches secondEmail email'
            );
            assert.equal(
              !!result[0].isPrimary,
              true,
              'isPrimary is true on secondEmail email'
            );
            assert.equal(
              !!result[0].isVerified,
              true,
              'matches secondEmail isVerified'
            );

            assert.equal(
              result[1].email,
              user.account.email,
              'matches account email'
            );
            assert.equal(
              !!result[1].isPrimary,
              false,
              'isPrimary is false on account email'
            );
            assert.equal(
              !!result[1].isVerified,
              !!user.account.emailVerified,
              'matches account emailVerified'
            );
          });
      });
    });

    describe('add account, verify session and keyfetch with tokenVerificationCode', () => {
      let user;

      before(() => {
        user = fake.newUserDataHex();

        return client
          .putThen('/account/' + user.accountId, user.account)
          .then(function (r) {
            respOkEmpty(r);
          });
      });

      it('should verify session and keyfetch with tokenVerificationCode', () => {
        return P.all([
          client.putThen(
            '/sessionToken/' + user.sessionTokenId,
            user.sessionToken
          ),
          client.putThen(
            '/keyFetchToken/' + user.keyFetchTokenId,
            user.keyFetchToken
          ),
        ])
          .spread((sessionToken, keyFetchToken) => {
            respOkEmpty(sessionToken);
            respOkEmpty(keyFetchToken);
            return client.getThen('/sessionToken/' + user.sessionTokenId);
          })
          .then((r) => {
            respOk(r);
            return client.postThen(
              '/tokens/' +
                user.sessionToken.tokenVerificationCode +
                '/verifyCode',
              {
                uid: user.accountId,
              }
            );
          })
          .then((r) => {
            respOk(r);
            return P.all([
              client.getThen('/sessionToken/' + user.sessionTokenId),
              client.getThen(
                '/keyFetchToken/' + user.keyFetchTokenId + '/verified'
              ),
            ]);
          })
          .spread((sessionTokenResp, keyFetchTokenResp) => {
            respOk(sessionTokenResp);
            respOk(keyFetchTokenResp);
            const sessionToken = sessionTokenResp.obj;
            const keyFetchToken = keyFetchTokenResp.obj;
            assert.isNull(sessionToken.tokenVerificationId);
            assert.notOk(sessionToken.tokenVerificationCodeHash);
            assert.notOk(sessionToken.tokenVerificationCodeExpiresAt);
            assert.isNull(keyFetchToken.tokenVerificationId);
          });
      });
    });

    describe('totp tokens', () => {
      let user;
      beforeEach(() => {
        user = fake.newUserDataHex();
        return client
          .putThen('/account/' + user.accountId, user.account)
          .then((r) => {
            respOkEmpty(r);
            return client.putThen('/totp/' + user.accountId, user.totp);
          })
          .then((r) => respOkEmpty(r));
      });

      it('should get totp token', () => {
        return client.getThen('/totp/' + user.accountId).then((r) => {
          const result = r.obj;
          assert.equal(
            result.sharedSecret,
            user.totp.sharedSecret,
            'sharedSecret set'
          );
          assert.equal(result.epoch, user.totp.epoch, 'epoch set');
          assert.equal(result.verified, user.totp.verified, 'verified set');
          assert.equal(result.enabled, user.totp.enabled, 'enabled set');
        });
      });

      it('should delete totp token', () => {
        return client.delThen('/totp/' + user.accountId).then((r) => {
          respOkEmpty(r);
          return client
            .getThen('/totp/' + user.accountId)
            .then(assert.fail, (err) => testNotFound(err));
        });
      });

      it('should update totp token', () => {
        const totpOptions = {
          verified: true,
          enabled: true,
        };
        return client
          .postThen('/totp/' + user.accountId + '/update', totpOptions)
          .then((r) => {
            respOkEmpty(r);
            return client.getThen('/totp/' + user.accountId).then((r) => {
              const result = r.obj;
              assert.equal(
                result.sharedSecret,
                user.totp.sharedSecret,
                'sharedSecret set'
              );
              assert.equal(result.epoch, user.totp.epoch, 'epoch set');
              assert.equal(
                result.verified,
                totpOptions.verified,
                'verified set'
              );
              assert.equal(result.enabled, user.totp.enabled, 'enable set');
            });
          });
      });
    });

    describe('should set session verification method', () => {
      let user;
      beforeEach(() => {
        user = fake.newUserDataHex();
        return client
          .putThen('/account/' + user.accountId, user.account)
          .then((r) => {
            respOkEmpty(r);
            return client.putThen('/totp/' + user.accountId, user.totp);
          })
          .then((r) => respOkEmpty(r))
          .then(() =>
            client.putThen(
              '/sessionToken/' + user.sessionTokenId,
              user.sessionToken
            )
          )
          .then((res) => respOkEmpty(res));
      });

      it('set session verification method - totp-2fa', () => {
        const verifyOptions = {
          verificationMethod: 'totp-2fa',
        };
        return client
          .postThen(
            '/tokens/' + user.sessionTokenId + '/verifyWithMethod',
            verifyOptions
          )
          .then((res) => {
            respOkEmpty(res);
            return client.getThen('/sessionToken/' + user.sessionTokenId);
          })
          .then((sessionToken) => {
            sessionToken = sessionToken.obj;
            assert.equal(
              sessionToken.verificationMethod,
              2,
              'verificationMethod set'
            );
            assert.ok(sessionToken.verifiedAt, 'verifiedAt set');
          });
      });

      it('set session verification method - recovery-code', () => {
        const verifyOptions = {
          verificationMethod: 'recovery-code',
        };
        return client
          .postThen(
            '/tokens/' + user.sessionTokenId + '/verifyWithMethod',
            verifyOptions
          )
          .then((res) => {
            respOkEmpty(res);
            return client.getThen('/sessionToken/' + user.sessionTokenId);
          })
          .then((sessionToken) => {
            sessionToken = sessionToken.obj;
            assert.equal(
              sessionToken.verificationMethod,
              3,
              'verificationMethod set'
            );
            assert.ok(sessionToken.verifiedAt, 'verifiedAt set');
          });
      });
    });

    describe('recovery codes', function () {
      // Consuming recovery codes is more time intensive since the scrypt hashes need
      // to be compared. Let set timeout higher than 2s default.
      this.timeout(12000);

      let user;
      beforeEach(() => {
        user = fake.newUserDataHex();
        return client
          .putThen('/account/' + user.accountId, user.account)
          .then((r) => {
            respOkEmpty(r);
          });
      });

      it('should generate new recovery codes', () => {
        return client
          .postThen('/account/' + user.accountId + '/recoveryCodes', {
            count: 8,
          })
          .then((res) => {
            const codes = res.obj;
            assert.lengthOf(codes, 8);
          });
      });

      it('should fail to consume unknown recovery code', () => {
        return client
          .postThen(
            '/account/' + user.accountId + '/recoveryCodes/' + '12345678'
          )
          .then(assert.fail, (err) => {
            testNotFound(err);
          });
      });

      it('should consume recovery code', () => {
        return client
          .postThen('/account/' + user.accountId + '/recoveryCodes', {
            count: 8,
          })
          .then((res) => {
            const codes = res.obj;
            assert.lengthOf(codes, 8);
            return client.postThen(
              '/account/' + user.accountId + '/recoveryCodes/' + codes[0]
            );
          })
          .then((res) => {
            const result = res.obj;
            assert.equal(
              result.remaining,
              7,
              'correct number of remaining codes'
            );
          });
      });
    });

    describe('recovery key', function () {
      let user, recoveryKey;
      beforeEach(() => {
        user = fake.newUserDataHex();
        return client
          .putThen('/account/' + user.accountId, user.account)
          .then((r) => {
            respOkEmpty(r);
            recoveryKey = {
              recoveryKeyId: crypto.randomBytes(16).toString('hex'),
              recoveryData: crypto.randomBytes(64).toString('hex'),
              enabled: true,
            };
            return client.postThen(
              '/account/' + user.accountId + '/recoveryKey',
              recoveryKey
            );
          })
          .then((r) => {
            respOkEmpty(r);
          });
      });

      it('should create a recovery key', () => {
        assert.ok(recoveryKey);
      });

      it('should get a recovery key', () => {
        return client
          .getThen(
            '/account/' +
              user.accountId +
              '/recoveryKey/' +
              recoveryKey.recoveryKeyId
          )
          .then((res) => {
            const recoveryKeyResult = res.obj;
            assert.equal(
              recoveryKeyResult.recoveryData,
              recoveryKey.recoveryData,
              'recoveryData match'
            );
            assert.equal(recoveryKeyResult.enabled, true);
            assert.ok(recoveryKeyResult.createdAt);
          });
      });

      it('should delete a recovery key', () => {
        return client
          .delThen('/account/' + user.accountId + '/recoveryKey')
          .then((r) => {
            respOkEmpty(r);
          });
      });

      it('should check if recovery key exists', () => {
        return client
          .getThen('/account/' + user.accountId + '/recoveryKey')
          .then((res) => {
            const result = res.obj;
            assert.isTrue(result.exists);
          });
      });

      it('should create disabled key and then enable it', async () => {
        user = fake.newUserDataHex();
        let res = await client.putThen(
          '/account/' + user.accountId,
          user.account
        );
        respOkEmpty(res);
        recoveryKey = {
          recoveryKeyId: crypto.randomBytes(16).toString('hex'),
          recoveryData: crypto.randomBytes(64).toString('hex'),
          enabled: false,
        };
        res = await client.postThen(
          '/account/' + user.accountId + '/recoveryKey',
          recoveryKey
        );
        respOkEmpty(res);

        res = await client.getThen(
          '/account/' +
            user.accountId +
            '/recoveryKey/' +
            recoveryKey.recoveryKeyId
        );
        let result = res.obj;
        assert.equal(
          result.recoveryData,
          recoveryKey.recoveryData,
          'recoveryData match'
        );
        assert.equal(result.enabled, false);
        assert.ok(result.createdAt);

        const updatedKey = Object.assign({}, recoveryKey, {
          enabled: true,
          verifiedAt: Date.now(),
        });
        res = await client.postThen(
          '/account/' + user.accountId + '/recoveryKey/update',
          updatedKey
        );
        respOkEmpty(res);

        res = await client.getThen(
          '/account/' +
            user.accountId +
            '/recoveryKey/' +
            recoveryKey.recoveryKeyId
        );
        result = res.obj;
        assert.equal(
          result.recoveryData,
          recoveryKey.recoveryData,
          'recoveryData match'
        );
        assert.equal(result.enabled, true);
        assert.ok(result.verifiedAt);
      });
    });

    describe('ecosystem anon id', async () => {
      let user;
      const ecosystemAnonId = 'eyJhbGciOiJFQ0RILUVTIiwia';

      beforeEach(async () => {
        user = fake.newUserDataHex();
        const r = await client.putThen(
          '/account/' + user.accountId,
          user.account
        );
        respOkEmpty(r);
      });

      it('should update ecosystem anon id', async () => {
        let r = await client.putThen(
          '/account/' + user.accountId + '/ecosystemAnonId',
          {
            ecosystemAnonId,
          }
        );
        respOkEmpty(r);

        r = await client.getThen('/account/' + user.accountId);
        const account = r.obj;
        assert.equal(account.ecosystemAnonId, ecosystemAnonId);
      });
    });

    after(() => server.close());
  });
};
