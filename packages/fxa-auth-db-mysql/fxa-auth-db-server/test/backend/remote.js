/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var test = require('tap').test

var crypto = require('crypto')
var fake = require('../fake')
var P = require('../../lib/promise')
var clientThen = require('../client-then')

function emailToHex(email) {
  return Buffer(email).toString('hex')
}

// Helper function that performs two tests:
//
// (1) checks that the response is a 200
// (2) checks that the content-type header is correct
//
// Takes the test object (t) and the response object (r).
function respOk(t, r) {
  t.equal(r.res.statusCode, 200, 'returns a 200')
  t.equal(r.res.headers['content-type'], 'application/json', 'json is returned')
}

// Helper function that performs three tests:
//
// (1) checks that the response is a 200
// (2) checks that the content-type header is correct
// (3) checks that the response was an empty object
//
// Takes the test object (t) and the response object (r).
function respOkEmpty(t, r) {
  t.equal(r.res.statusCode, 200, 'returns a 200')
  t.equal(r.res.headers['content-type'], 'application/json', 'json is returned')
  t.deepEqual(r.obj, {}, 'Returned object is empty')
}

// Helper function that performs two tests:
//
// (1) checks that the response is a 404
// (2) checks that the error body for a 404 is consistent
//
// Takes the test object (t) and the error object (err).
function testNotFound(t, err) {
  t.equal(err.statusCode, 404, 'returns a 404')
  t.deepEqual(err.body, {
    message: 'Not Found',
    errno: 116,
    error: 'Not Found',
    code: 404
  }, 'Object contains no other fields')
}

// Helper function that tests for the server failure event.
//
// Takes two arguments:
//
// 1. the test object (t)
// 2. the restify server object (server)
//
// Returns a promise to be resolved with failure event
// when one is emitted by the server.
function captureFailureEvent(t, server) {
  return new P(function(resolve, reject) {
    server.once('failure', resolve)
  })
}

// Helper test that calls the version route and checks response that checks the version route response.
//
// Takes the client, and a route, either '/' or '/__version__'.
//
function testVersionResponse(client, route) {
  return function (t) {
    client.getThen(route)
      .then(function (r) {
        t.equal(r.res.statusCode, 200, 'version returns 200 OK')
        t.ok(r.obj.version.match(/\d+\.\d+\.\d+/),
             'Version has a semver version property')
        t.ok(['Memory', 'MySql'].indexOf(r.obj.implementation) !== -1,
             'Version has a known implementation  property')
        t.end()
      })
  }
}

// To run these tests from a new backend, create a DB instance, start a test server
// and pass the config containing the connection params to this function. The tests
// will run against that server. Second argument is the restify server object, for
// testing of events via `server.on`.
module.exports = function(cfg, server) {

  var d = P.defer()

  var client = clientThen({ url : 'http://' + cfg.hostname + ':' + cfg.port })

  test(
    'heartbeat',
    function (t) {
      return client.getThen('/__heartbeat__')
        .then(function (r) {
          t.deepEqual(r.obj, {}, 'Heartbeat contains an empty object and nothing unexpected')
        })
    }
  )

  test('version', testVersionResponse(client, '/'))
  test('version', testVersionResponse(client, '/__version__'))

  test(
    'account not found',
    function (t) {
      t.plan(2)
      return client.getThen('/account/hello-world')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
        }, function(err) {
          testNotFound(t, err)
        })
    }
  )

  test(
    'add account, check password, retrieve it, delete it',
    function (t) {
      t.plan(35)
      var user = fake.newUserDataHex()
      return client.putThen('/account/' + user.accountId, user.account)
        .then(function(r) {
          respOkEmpty(t, r)
          var randomPassword = Buffer(crypto.randomBytes(32)).toString('hex')
          return client.postThen('/account/' + user.accountId + '/checkPassword', {'verifyHash': randomPassword})
        })
        .then(function(r) {
          t.fail('should not be here, password isn\'t valid')
        }, function(err) {
          t.ok(err, 'incorrect password produces an error')
          return client.postThen('/account/' + user.accountId + '/checkPassword', {'verifyHash': user.account.verifyHash})
        })
        .then(function(r) {
          respOk(t, r)
          var account = r.obj
          t.equal(account.uid, user.accountId)
          return client.getThen('/account/' + user.accountId)
        })
        .then(function(r) {
          respOk(t, r)

          var account = r.obj
          var fields = 'accountId,email,emailCode,kA,verifierVersion,authSalt'.split(',')
          fields.forEach(function(f) {
            t.equal(user.account[f], account[f], 'Both Fields ' + f + ' are the same')
          })
          t.equal(user.account.emailVerified, !!account.emailVerified, 'Both fields emailVerified are the same')
          t.notOk(account.verifyHash, 'verifyHash field should be absent')
        }, function(err) {
          t.fail('Error for some reason:' + err)
        })
        .then(function() {
          return client.headThen('/emailRecord/' + emailToHex(user.account.email))
        })
        .then(function(r) {
          respOkEmpty(t, r)
          return client.getThen('/emailRecord/' + emailToHex(user.account.email))
        })
        .then(function(r) {
          respOk(t, r)
          var account = r.obj
          var fields = 'accountId,email,emailCode,kA,verifierVersion,authSalt'.split(',')
          fields.forEach(function(f) {
            t.equal(user.account[f], account[f], 'Both Fields ' + f + ' are the same')
          })
          t.equal(user.account.emailVerified, !!account.emailVerified, 'Both fields emailVerified are the same')
          t.notOk(account.verifyHash, 'verifyHash field should be absent')
        })
        .then(function() {
          return client.delThen('/account/' + user.accountId)
        })
        .then(function(r) {
          respOk(t, r)
          // now make sure this record no longer exists
          return client.headThen('/emailRecord/' + emailToHex(user.account.email))
        })
        .then(function(r) {
          t.fail('Should not be here, since this account no longer exists')
        }, function(err) {
          t.equal(err.toString(), 'NotFoundError', 'Account not found (no body due to being a HEAD request')
          t.deepEqual(err.body, {}, 'Body contains nothing since this is a HEAD request')
          t.deepEqual(err.statusCode, 404, 'Status Code is 404')
        })
    }
  )

  test(
    'session token handling',
    function (t) {
      t.plan(87)
      var user = fake.newUserDataHex()
      var badUser = fake.newUserDataHex()
      delete badUser.sessionToken.tokenVerificationId

      // Fetch all of the session tokens for the account
      return client.getThen('/account/' + user.accountId + '/sessions')
        .then(function(r) {
          respOk(t, r)
          t.ok(Array.isArray(r.obj), 'sessions is array')
          t.equal(r.obj.length, 0, 'sessions is empty')

          // Create an account
          return client.putThen('/account/' + user.accountId, user.account)
        })
        .then(function() {
          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions')
        })
        .then(function(r) {
          t.equal(r.obj.length, 0, 'sessions is empty')

          // Attempt to fetch a non-existent session token
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          t.fail('A non-existent session token should not have returned anything')
        }, function(err) {
          testNotFound(t, err)

          // Attempt to fetch a non-existent session token with its verification state
          return client.getThen('/sessionToken/' + user.sessionTokenId + '/verified')
        })
        .then(function(r) {
          t.fail('A non-existent session token should not have returned anything')
        }, function(err) {
          testNotFound(t, err)

          // Attempt to create a session token with no tokenVerificationId
          return client.putThen('/sessionToken/' + badUser.sessionTokenId, badUser.sessionToken)
        })
        .then(function () {
          t.fail('Should have failed to create a session token with no tokenVerificationId')
        }, function (err) {
          t.pass('Correctly failed to create a session token with no tokenVerificationId')
        })
        .then(function () {
          // Create a session token
          return client.putThen('/sessionToken/' + user.sessionTokenId, user.sessionToken)
        })
        .then(function(r) {
          respOk(t, r)

          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions')
        })
        .then(function(r) {
          respOk(t, r)
          var sessions = r.obj
          t.equal(sessions.length, 1, 'sessions contains one item')
          t.equal(Object.keys(sessions[0]).length, 9, 'session has nine properties')
          t.equal(sessions[0].tokenId, user.sessionTokenId, 'tokenId is correct')
          t.equal(sessions[0].uid, user.accountId, 'uid is correct')
          t.equal(sessions[0].createdAt, user.sessionToken.createdAt, 'createdAt is correct')
          t.equal(sessions[0].uaBrowser, user.sessionToken.uaBrowser, 'uaBrowser is correct')
          t.equal(sessions[0].uaBrowserVersion, user.sessionToken.uaBrowserVersion, 'uaBrowserVersion is correct')
          t.equal(sessions[0].uaOS, user.sessionToken.uaOS, 'uaOS is correct')
          t.equal(sessions[0].uaOSVersion, user.sessionToken.uaOSVersion, 'uaOSVersion is correct')
          t.equal(sessions[0].uaDeviceType, user.sessionToken.uaDeviceType, 'uaDeviceType is correct')
          t.equal(sessions[0].lastAccessTime, user.sessionToken.createdAt, 'lastAccessTime is correct')

          // Fetch the session token
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.sessionToken()
          t.deepEqual(token.tokenData, user.sessionToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.equal(token.createdAt, user.sessionToken.createdAt, 'createdAt matches')
          t.equal(token.uaBrowser, user.sessionToken.uaBrowser, 'uaBrowser matches')
          t.equal(token.uaBrowserVersion, user.sessionToken.uaBrowserVersion, 'uaBrowserVersion matches')
          t.equal(token.uaOS, user.sessionToken.uaOS, 'uaOS matches')
          t.equal(token.uaOSVersion, user.sessionToken.uaOSVersion, 'uaOSVersion matches')
          t.equal(token.uaDeviceType, user.sessionToken.uaDeviceType, 'uaDeviceType matches')
          t.equal(token.lastAccessTime, token.createdAt, 'lastAccessTime was set')
          t.equal(!!token.emailVerified, user.account.emailVerified, 'emailVerified same as account emailVerified')
          t.equal(token.email, user.account.email, 'token.email same as account email')
          t.deepEqual(token.emailCode, user.account.emailCode, 'token emailCode same as account emailCode')
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
          t.ok(token.accountCreatedAt > 0, 'accountCreatedAt is positive number')
          t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

          // Fetch the session token with its verification state
          return client.getThen('/sessionToken/' + user.sessionTokenId + '/verified')
        })
        .then(function(r) {
          var token = r.obj

          t.deepEqual(token.tokenData, user.sessionToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.equal(token.createdAt, user.sessionToken.createdAt, 'createdAt matches')
          t.equal(token.uaBrowser, user.sessionToken.uaBrowser, 'uaBrowser matches')
          t.equal(token.uaBrowserVersion, user.sessionToken.uaBrowserVersion, 'uaBrowserVersion matches')
          t.equal(token.uaOS, user.sessionToken.uaOS, 'uaOS matches')
          t.equal(token.uaOSVersion, user.sessionToken.uaOSVersion, 'uaOSVersion matches')
          t.equal(token.uaDeviceType, user.sessionToken.uaDeviceType, 'uaDeviceType matches')
          t.equal(token.lastAccessTime, token.createdAt, 'lastAccessTime was set')
          t.equal(!!token.emailVerified, user.account.emailVerified, 'emailVerified same as account emailVerified')
          t.equal(token.email, user.account.email, 'token.email same as account email')
          t.deepEqual(token.emailCode, user.account.emailCode, 'token emailCode same as account emailCode')
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
          t.ok(token.accountCreatedAt > 0, 'accountCreatedAt is positive number')
          t.equal(token.tokenVerificationId, user.sessionToken.tokenVerificationId, 'tokenVerificationId is correct')

          // Verify the session token
          return client.postThen('/token/' + user.sessionToken.tokenVerificationId + '/verify', {
            uid: user.accountId
          })
        })
        .then(function() {
          // Fetch the session token
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          t.equal(r.obj.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

          // Fetch the session token with its verification state
          return client.getThen('/sessionToken/' + user.sessionTokenId + '/verified')
        })
        .then(function(r) {
          t.equal(r.obj.tokenVerificationId, null, 'tokenVerificationId is null')

          // Update the session token
          return client.postThen('/sessionToken/' + user.sessionTokenId + '/update', {
            uaBrowser: 'different browser',
            uaBrowserVersion: 'different browser version',
            uaOS: 'different OS',
            uaOSVersion: 'different OS version',
            uaDeviceType: 'different device type',
            lastAccessTime: 42
          })
        })
        .then(function(r) {
          respOk(t, r)

          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions')
        })
        .then(function(r) {
          respOk(t, r)
          var sessions = r.obj
          t.equal(sessions.length, 1, 'sessions still contains one item')
          t.equal(sessions[0].tokenId, user.sessionTokenId, 'tokenId is correct')
          t.equal(sessions[0].uid, user.accountId, 'uid is correct')
          t.equal(sessions[0].createdAt, user.sessionToken.createdAt, 'createdAt is correct')
          t.equal(sessions[0].uaBrowser, 'different browser', 'uaBrowser is correct')
          t.equal(sessions[0].uaBrowserVersion, 'different browser version', 'uaBrowserVersion is correct')
          t.equal(sessions[0].uaOS, 'different OS', 'uaOS is correct')
          t.equal(sessions[0].uaOSVersion, 'different OS version', 'uaOSVersion is correct')
          t.equal(sessions[0].uaDeviceType, 'different device type', 'uaDeviceType is correct')
          t.equal(sessions[0].lastAccessTime, 42, 'lastAccessTime is correct')

          // Fetch the session token
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.sessionToken()
          t.deepEqual(token.tokenData, user.sessionToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.equal(token.createdAt, user.sessionToken.createdAt, 'createdAt was not updated')
          t.equal(token.uaBrowser, 'different browser', 'uaBrowser was updated')
          t.equal(token.uaBrowserVersion, 'different browser version', 'uaBrowserVersion was updated')
          t.equal(token.uaOS, 'different OS', 'uaOS was updated')
          t.equal(token.uaOSVersion, 'different OS version', 'uaOSVersion was updated')
          t.equal(token.uaDeviceType, 'different device type', 'uaDeviceType was updated')
          t.equal(token.lastAccessTime, 42, 'lastAccessTime was updated')

          // Delete the session token
          return client.delThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          respOk(t, r)

          // Fetch all of the session tokens for the account
          return client.getThen('/account/' + user.accountId + '/sessions')
        })
        .then(function(r) {
          respOk(t, r)
          t.equal(r.obj.length, 0, 'sessions is empty')

          // Attempt to fetch the deleted session token
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant sessionToken should have failed')
        }, function(err) {
          testNotFound(t, err)
        })
    }
  )

  test(
    'device handling',
    function (t) {
      t.plan(51)
      var user = fake.newUserDataHex()
      return client.getThen('/account/' + user.accountId + '/devices')
        .then(function(r) {
          respOk(t, r)
          t.ok(Array.isArray(r.obj), 'devices is array')
          t.equal(r.obj.length, 0, 'devices is empty')
          return client.putThen('/account/' + user.accountId, user.account)
        })
        .then(function() {
          return client.putThen('/sessionToken/' + user.sessionTokenId, user.sessionToken)
        })
        .then(function() {
          return client.getThen('/account/' + user.accountId + '/devices')
        })
        .then(function(r) {
          t.equal(r.obj.length, 0, 'devices is empty')
          return client.putThen('/account/' + user.accountId + '/device/' + user.deviceId, user.device)
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/account/' + user.accountId + '/devices')
        })
        .then(function(r) {
          respOk(t, r)
          var devices = r.obj
          t.equal(devices.length, 1, 'devices contains one item')
          t.equal(Object.keys(devices[0]).length, 15, 'device has fourteen properties')
          t.equal(devices[0].uid, user.accountId, 'uid is correct')
          t.equal(devices[0].id, user.deviceId, 'id is correct')
          t.equal(devices[0].sessionTokenId, user.sessionTokenId, 'sessionTokenId is correct')
          t.equal(devices[0].createdAt, user.device.createdAt, 'createdAt is correct')
          t.equal(devices[0].name, user.device.name, 'name is correct')
          t.equal(devices[0].type, user.device.type, 'type is correct')
          t.equal(devices[0].callbackURL, user.device.callbackURL, 'callbackURL is correct')
          t.equal(devices[0].callbackPublicKey, user.device.callbackPublicKey, 'callbackPublicKey is correct')
          t.equal(devices[0].callbackAuthKey, user.device.callbackAuthKey, 'callbackAuthKey is correct')
          t.equal(devices[0].uaBrowser, user.sessionToken.uaBrowser, 'uaBrowser is correct')
          t.equal(devices[0].uaBrowserVersion, user.sessionToken.uaBrowserVersion, 'uaBrowserVersion is correct')
          t.equal(devices[0].uaOS, user.sessionToken.uaOS, 'uaOS is correct')
          t.equal(devices[0].uaOSVersion, user.sessionToken.uaOSVersion, 'uaOSVersion is correct')
          t.equal(devices[0].uaDeviceType, user.sessionToken.uaDeviceType, 'uaDeviceType is correct')
          t.equal(devices[0].lastAccessTime, user.sessionToken.createdAt, 'lastAccessTime is correct')
          return client.postThen('/account/' + user.accountId + '/device/' + user.deviceId + '/update', {
            name: 'wibble',
            type: 'mobile',
            callbackURL: '',
            callbackPublicKey: null,
            callbackAuthKey: null
          })
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/account/' + user.accountId + '/devices')
        })
        .then(function(r) {
          respOk(t, r)
          var devices = r.obj
          t.equal(devices.length, 1, 'devices still contains one item')
          t.equal(devices[0].uid, user.accountId, 'uid is correct')
          t.equal(devices[0].id, user.deviceId, 'id is correct')
          t.equal(devices[0].sessionTokenId, user.sessionTokenId, 'sessionTokenId is correct')
          t.equal(devices[0].createdAt, user.device.createdAt, 'createdAt is correct')
          t.equal(devices[0].name, 'wibble', 'name is correct')
          t.equal(devices[0].type, 'mobile', 'type is correct')
          t.equal(devices[0].callbackURL, '', 'callbackURL is correct')
          t.equal(devices[0].callbackPublicKey, user.device.callbackPublicKey, 'callbackPublicKey is correct')
          t.equal(devices[0].callbackAuthKey, user.device.callbackAuthKey, 'callbackAuthKey is correct')
          t.equal(devices[0].uaBrowser, user.sessionToken.uaBrowser, 'uaBrowser is correct')
          t.equal(devices[0].uaBrowserVersion, user.sessionToken.uaBrowserVersion, 'uaBrowserVersion is correct')
          t.equal(devices[0].uaOS, user.sessionToken.uaOS, 'uaOS is correct')
          t.equal(devices[0].uaOSVersion, user.sessionToken.uaOSVersion, 'uaOSVersion is correct')
          t.equal(devices[0].uaDeviceType, user.sessionToken.uaDeviceType, 'uaDeviceType is correct')
          t.equal(devices[0].lastAccessTime, user.sessionToken.createdAt, 'lastAccessTime is correct')
          return client.delThen('/account/' + user.accountId + '/device/' + user.deviceId)
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/account/' + user.accountId + '/devices')
        })
        .then(function(r) {
          respOk(t, r)
          t.equal(r.obj.length, 0, 'devices is empty')
        })
    }
  )

  test(
    'key fetch token handling',
    function (t) {
      t.plan(27)
      var user = fake.newUserDataHex()
      var badUser = fake.newUserDataHex()
      delete badUser.keyFetchToken.tokenVerificationId

      // Create an account
      return client.putThen('/account/' + user.accountId, user.account)
        .then(function() {
          // Attempt to fetch a non-existent key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          t.fail('A non-existent keyFetchToken should not have returned anything')
        }, function(err) {
          testNotFound(t, err)

          // Attempt to fetch a non-existent key fetch token with its verification state
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId + '/verified')
        })
        .then(function(r) {
          t.fail('A non-existent keyFetchToken should not have returned anything')
        }, function(err) {
          testNotFound(t, err)

          // Attempt to create a key fetch token with no tokenVerificationId
          return client.putThen('/keyFetchToken/' + badUser.keyFetchTokenId, badUser.keyFetchToken)
        })
        .then(function () {
          t.fail('Should have failed to create a key fetch token with no tokenVerificationId')
        }, function (err) {
          t.pass('Correctly failed to create a key fetch token with no tokenVerificationId')
        })
        .then(function () {
          // Create a key fetch token
          return client.putThen('/keyFetchToken/' + user.keyFetchTokenId, user.keyFetchToken)
        })
        .then(function(r) {
          respOk(t, r)

          // Fetch the key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.keyFetchToken()
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.deepEqual(token.authKey, user.keyFetchToken.authKey, 'authKey matches')
          t.deepEqual(token.keyBundle, user.keyFetchToken.keyBundle, 'keyBundle matches')
          t.ok(token.createdAt, 'Got a createdAt')
          t.equal(!!token.emailVerified, user.account.emailVerified)
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
          t.equal(token.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

          // Fetch the key fetch token with its verification state
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId + '/verified')
        })
        .then(function(r) {
          var token = r.obj

          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.deepEqual(token.authKey, user.keyFetchToken.authKey, 'authKey matches')
          t.deepEqual(token.keyBundle, user.keyFetchToken.keyBundle, 'keyBundle matches')
          t.ok(token.createdAt, 'Got a createdAt')
          t.equal(!!token.emailVerified, user.account.emailVerified)
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')
          t.equal(token.tokenVerificationId, user.keyFetchToken.tokenVerificationId, 'tokenVerificationId is correct')

          // Verify the key fetch token
          return client.postThen('/token/' + user.keyFetchToken.tokenVerificationId + '/verify', {
            uid: user.accountId
          })
        })
        .then(function() {
          // Fetch the key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          t.equal(r.obj.tokenVerificationId, undefined, 'tokenVerificationId is undefined')

          // Fetch the key fetch token with its verification state
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId + '/verified')
        })
        .then(function(r) {
          t.equal(r.obj.tokenVerificationId, null, 'tokenVerificationId is null')

          // Delete the key fetch token
          return client.delThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          respOk(t, r)

          // Attempt to fetch the deleted key fetch token
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant keyFetchToken should have failed')
        }, function(err) {
          testNotFound(t, err)
        })
    }
  )

  test(
    'account reset token handling',
    function (t) {
      t.plan(11)
      var user = fake.newUserDataHex()
      return client.putThen('/account/' + user.accountId, user.account)
        .then(function() {
          return client.getThen('/accountResetToken/' + user.accountResetTokenId)
        })
        .then(function(r) {
          t.fail('A non-existant session token should not have returned anything')
        }, function(err) {
          t.pass('No session token exists yet')
          return client.putThen('/accountResetToken/' + user.accountResetTokenId, user.accountResetToken)
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/accountResetToken/' + user.accountResetTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.accountResetToken()
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.deepEqual(token.tokenData, user.accountResetToken.data, 'token data matches')
          t.ok(token.createdAt, 'Got a createdAt')
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

          // now delete it
          return client.delThen('/accountResetToken/' + user.accountResetTokenId)
        })
        .then(function(r) {
          respOk(t, r)
          // now make sure the token no longer exists
          return client.getThen('/accountResetToken/' + user.accountResetTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant accountResetToken should have failed')
        }, function(err) {
          testNotFound(t, err)
        })
    }
  )

  test(
    'password change token handling',
    function (t) {
      t.plan(11)
      var user = fake.newUserDataHex()
      return client.putThen('/account/' + user.accountId, user.account)
        .then(function() {
          return client.getThen('/passwordChangeToken/' + user.passwordChangeTokenId)
        })
        .then(function(r) {
          t.fail('A non-existant session token should not have returned anything')
        }, function(err) {
          t.pass('No session token exists yet')
          return client.putThen('/passwordChangeToken/' + user.passwordChangeTokenId, user.passwordChangeToken)
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/passwordChangeToken/' + user.passwordChangeTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.passwordChangeToken()
          t.deepEqual(token.tokenData, user.passwordChangeToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.ok(token.createdAt, 'Got a createdAt')
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

          // now delete it
          return client.delThen('/passwordChangeToken/' + user.passwordChangeTokenId)
        })
        .then(function(r) {
          respOk(t, r)
          // now make sure the token no longer exists
          return client.getThen('/passwordChangeToken/' + user.passwordChangeTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant passwordChangeToken should have failed')
        }, function(err) {
          testNotFound(t, err)
        })
    }
  )

  test(
    'password forgot token handling',
    function (t) {
      t.plan(23)
      var user = fake.newUserDataHex()
      return client.putThen('/account/' + user.accountId, user.account)
        .then(function() {
          return client.getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
        })
        .then(function(r) {
          t.fail('A non-existant session token should not have returned anything')
        }, function(err) {
          t.pass('No session token exists yet')
          return client.putThen('/passwordForgotToken/' + user.passwordForgotTokenId, user.passwordForgotToken)
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.passwordForgotToken()
          t.deepEqual(token.tokenData, user.passwordForgotToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.ok(token.createdAt, 'Got a createdAt')
          t.deepEqual(token.passCode, user.passwordForgotToken.passCode)
          t.equal(token.tries, user.passwordForgotToken.tries, 'Tries is correct')
          t.equal(token.email, user.account.email)
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

          // now update this token (with extra tries)
          user.passwordForgotToken.tries += 1
          return client.postThen('/passwordForgotToken/' + user.passwordForgotTokenId + '/update', user.passwordForgotToken)
        })
        .then(function(r) {
          respOk(t, r)

          // re-fetch this token
          return client.getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.passwordForgotToken()
          t.deepEqual(token.tokenData, user.passwordForgotToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.ok(token.createdAt, 'Got a createdAt')
          t.deepEqual(token.passCode, user.passwordForgotToken.passCode)
          t.equal(token.tries, user.passwordForgotToken.tries, 'Tries is correct (now incremented)')
          t.equal(token.email, user.account.email)
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

          // now delete it
          return client.delThen('/passwordForgotToken/' + user.passwordForgotTokenId)
        })
        .then(function(r) {
          respOk(t, r)
          // now make sure the token no longer exists
          return client.getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant passwordForgotToken should have failed')
        }, function(err) {
          testNotFound(t, err)
        })
    }
  )

  test(
    'password forgot token verified',
    function (t) {
      t.plan(16)
      var user = fake.newUserDataHex()
      return client.putThen('/account/' + user.accountId, user.account)
        .then(function(r) {
          respOk(t, r)
          return client.putThen('/passwordForgotToken/' + user.passwordForgotTokenId, user.passwordForgotToken)
        })
        .then(function(r) {
          respOk(t, r)
          // now, verify the password (which inserts the accountResetToken)
          user.accountResetToken.tokenId = user.accountResetTokenId
          return client.postThen('/passwordForgotToken/' + user.passwordForgotTokenId + '/verified', user.accountResetToken)
        })
        .then(function(r) {
          respOk(t, r)
          // check the accountResetToken exists
          return client.getThen('/accountResetToken/' + user.accountResetTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.accountResetToken()
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.deepEqual(token.tokenData, user.accountResetToken.data, 'token data matches')
          t.ok(token.createdAt, 'Got a createdAt')
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

          // make sure then passwordForgotToken no longer exists
          return client.getThen('/passwordForgotToken/' + user.passwordForgotTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant passwordForgotToken should have failed')
        }, function(err) {
          testNotFound(t, err)
          // and check that the account has been verified
          return client.getThen('/emailRecord/' + emailToHex(user.account.email))
        })
        .then(function(r) {
          respOk(t, r)
          var account = r.obj
          t.equal(true, !!account.emailVerified, 'emailVerified is now true')
        })
        .then(function(r) {
          t.pass('All password forgot token verified tests passed')
        })
    }
  )

  test(
    'locale',
    function (t) {
      var user = fake.newUserDataHex()
      return client.putThen('/account/' + user.accountId, user.account)
        .then(
          function (r) {
            respOk(t, r)
            return client.putThen('/sessionToken/' + user.sessionTokenId, user.sessionToken)
          }
        )
        .then(
          function (r) {
            respOk(t, r)
            return client.postThen('/account/' + user.accountId + '/locale', { locale: 'en-US'})
          }
        )
        .then(
          function (r) {
            respOk(t, r)
            return client.getThen('/sessionToken/' + user.sessionTokenId)
          }
        )
        .then(
          function (r) {
            respOk(t, r)
            t.equal('en-US', r.obj.locale, 'locale was set properly')
          }
        )
    }
  )

  test(
    'add account, lock it, unlock it',
    function (t) {
      var user = fake.newUserDataHex()
      var unlockCode = user.unlockCode
      return client.putThen('/account/' + user.accountId, user.account)
        .then(
          function (r) {
            respOk(t, r)
            return client.postThen('/account/' + user.accountId + '/lock', { lockedAt: Date.now(), unlockCode: unlockCode })
          }
        )
        .then(
          function (r) {
            respOk(t, r)
            return client.getThen('/account/' + user.accountId + '/unlockCode')
          }
        )
        .then(
          function (r) {
            respOk(t, r)

            t.equal(r.obj.unlockCode, unlockCode, 'unlockCode was set properly')

            return client.postThen('/account/' + user.accountId + '/unlock')
          }
        )
        .then(
          function (r) {
            respOk(t, r)
          }
        )
    }
  )

  test(
    'GET an unknown path',
    function (t) {
      t.plan(3)
      var p = captureFailureEvent(t, server)
      return client.getThen('/foo')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
        }, function(err) {
          testNotFound(t, err)
          return p
        }).then(function () {
          t.ok('server emitted a failure event')
        })
    }
  )

  test(
    'PUT an unknown path',
    function (t) {
      t.plan(3)
      var p = captureFailureEvent(t, server)
      return client.putThen('/bar', {})
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
        }, function(err) {
          testNotFound(t, err)
          return p
        }).then(function () {
          t.ok('server emitted a failure event')
        })
    }
  )

  test(
    'POST an unknown path',
    function (t) {
      t.plan(3)
      var p = captureFailureEvent(t, server)
      return client.postThen('/baz', {})
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
        }, function(err) {
          testNotFound(t, err)
          return p
        }).then(function () {
          t.ok('server emitted a failure event')
        })
    }
  )

  test(
    'DELETE an unknown path',
    function (t) {
      t.plan(3)
      var p = captureFailureEvent(t, server)
      return client.delThen('/qux')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
        }, function(err) {
          testNotFound(t, err)
          return p
        }).then(function () {
          t.ok('server emitted a failure event')
        })
    }
  )

  test(
    'HEAD an unknown path',
    function (t) {
      t.plan(2)
      var p = captureFailureEvent(t, server)
      return client.headThen('/wibble')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
        }, function(err) {
          t.deepEqual(err.body, {}, 'Body is empty since this is a HEAD request')
          return p
        }).then(function () {
          t.ok('server emitted a failure event')
        })
    }
  )

  test(
    'teardown',
    function (t) {
      d.resolve()
      t.end()
    }
  )

  return d.promise

}
