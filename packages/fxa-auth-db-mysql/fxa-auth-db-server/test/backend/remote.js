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
function captureFailureEvents(t, server) {
  server.on('failure', t.pass.bind(t, 'The server emitted the failure event'))
}

// To run these tests from a new backend, create a DB instance, start a test server
// and pass the config containing the connection params to this function. The tests
// will run against that server. Second argument is the restify server object, for
// testing of events via `server.on`.
module.exports = function(cfg, server) {

  var d = P.defer()

  console.log(cfg)
  var client = clientThen({ url : 'http://' + cfg.hostname + ':' + cfg.port })
  console.log({ url : 'http://' + cfg.hostname + ':' + cfg.port })

  test(
    'heartbeat',
    function (t) {
      client.getThen('/__heartbeat__')
        .then(function (r) {
          t.deepEqual(r.obj, {}, 'Heartbeat contains an empty object and nothing unexpected')
          t.end()
        })
    }
  )

  test(
    'account not found',
    function (t) {
      t.plan(2)
      client.getThen('/account/hello-world')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'add account, check password, retrieve it, delete it',
    function (t) {
      t.plan(35)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
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
        .done(function() {
          t.end()
        }, function(err) {
          t.fail(err)
          t.end()
        })
    }
  )

  test(
    'session token handling',
    function (t) {
      t.plan(14)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
        .then(function() {
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          t.fail('A non-existant session token should not have returned anything')
        }, function(err) {
          t.pass('No session token exists yet')
          return client.putThen('/sessionToken/' + user.sessionTokenId, user.sessionToken)
        })
        .then(function(r) {
          respOk(t, r)
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          var token = r.obj

          // tokenId is not returned from db.sessionToken()
          t.deepEqual(token.tokenData, user.sessionToken.data, 'token data matches')
          t.deepEqual(token.uid, user.accountId, 'token belongs to this account')
          t.ok(token.createdAt, 'Got a createdAt')
          t.equal(!!token.emailVerified, user.account.emailVerified, 'emailVerified same as account emailVerified')
          t.equal(token.email, user.account.email, 'token.email same as account email')
          t.deepEqual(token.emailCode, user.account.emailCode, 'token emailCode same as account emailCode')
          t.ok(token.verifierSetAt, 'verifierSetAt is set to a truthy value')

          // now delete it
          return client.delThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          respOk(t, r)
          // now make sure the token no longer exists
          return client.getThen('/sessionToken/' + user.sessionTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant sessionToken should have failed')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'key fetch token handling',
    function (t) {
      t.plan(13)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
        .then(function() {
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          t.fail('A non-existant session token should not have returned anything')
        }, function(err) {
          t.pass('No session token exists yet')
          return client.putThen('/keyFetchToken/' + user.keyFetchTokenId, user.keyFetchToken)
        })
        .then(function(r) {
          respOk(t, r)
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

          // now delete it
          return client.delThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          respOk(t, r)
          // now make sure the token no longer exists
          return client.getThen('/keyFetchToken/' + user.keyFetchTokenId)
        })
        .then(function(r) {
          t.fail('Fetching the non-existant keyFetchToken should have failed')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'account reset token handling',
    function (t) {
      t.plan(11)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
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
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'password change token handling',
    function (t) {
      t.plan(11)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
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
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'password forgot token handling',
    function (t) {
      t.plan(19)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
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
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'password forgot token verified',
    function (t) {
      t.plan(16)
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
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
          t.end()
        }, function(err) {
          t.fail(err)
          t.end()
        })
    }
  )

  test(
    'locale',
    function (t) {
      var user = fake.newUserDataHex()
      client.putThen('/account/' + user.accountId, user.account)
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
        .done(
          function (r) {
            respOk(t, r)
            t.equal('en-US', r.obj.locale, 'locale was set properly')
            t.end()
          }
        )
    }
  )

  test(
    'add account, lock it, unlock it',
    function (t) {
      var user = fake.newUserDataHex()
      var unlockCode = user.unlockCode
      client.putThen('/account/' + user.accountId, user.account)
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
            t.end()
          }
        )
    }
  )

  test(
    'GET an unknown path',
    function (t) {
      t.plan(3)
      captureFailureEvents(t, server)
      client.getThen('/foo')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'PUT an unknown path',
    function (t) {
      t.plan(3)
      captureFailureEvents(t, server)
      client.putThen('/bar', {})
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'POST an unknown path',
    function (t) {
      t.plan(3)
      captureFailureEvents(t, server)
      client.postThen('/baz', {})
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'DELETE an unknown path',
    function (t) {
      t.plan(3)
      captureFailureEvents(t, server)
      client.delThen('/qux')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
          t.end()
        }, function(err) {
          testNotFound(t, err)
          t.end()
        })
    }
  )

  test(
    'HEAD an unknown path',
    function (t) {
      t.plan(2)
      captureFailureEvents(t, server)
      client.headThen('/wibble')
        .then(function(r) {
          t.fail('This request should have failed (instead it suceeded)')
          t.end()
        }, function(err) {
          t.deepEqual(err.body, {}, 'Body is empty since this is a HEAD request')
          t.end()
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
