/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var uuid = require('uuid')
var restify = require('restify')
var test = require('tap').test

var fake = require('../fake')
var TestServer = require('../test_server')
var config = require('../../config')
var clientThen = require('../client-then')

function emailToHex(email) {
  return Buffer(email).toString('hex')
}

var cfg = {
  port: 8000
}
var testServer = new TestServer(cfg)
var client = clientThen({ url : 'http://127.0.0.1:' + cfg.port })

test(
  'startup',
  function (t) {
    t.plan(2)
    testServer.start(function (err) {
      t.type(testServer.server, 'object', 'test server was started')
      t.equal(err, null, 'no errors were returned')
      t.end()
    })
  }
)

function respOk(t, r) {
  t.equal(r.res.statusCode, 200, 'returns a 200')
  t.equal(r.res.headers['content-type'], 'application/json', 'json is returned')
}

function respOkEmpty(t, r) {
  t.equal(r.res.statusCode, 200, 'returns a 200')
  t.equal(r.res.headers['content-type'], 'application/json', 'json is returned')
  t.deepEqual(r.obj, {}, 'Returned object is empty')
}

function testNotFound(t, err) {
  t.equal(err.statusCode, 404, 'returns a 404')
  t.deepEqual(err.body, { message : 'Not Found' }, 'Object contains no other fields')
}

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
  'add account, retrieve it, delete it',
  function (t) {
    t.plan(31)
    var user = fake.newUserDataHex()
    client.putThen('/account/' + user.accountId, user.account)
      .then(function(r) {
        respOkEmpty(t, r)
        return client.getThen('/account/' + user.accountId)
      })
      .then(function(r) {
        respOk(t, r)

        var account = r.obj
        var fields = 'accountId,email,emailCode,kA,verifierVersion,verifyHash,authSalt'.split(',')
        fields.forEach(function(f) {
          t.equal(user.account[f], account[f], 'Both Fields ' + f + ' are the same')
        })
        t.equal(user.account.emailVerified, !!account.emailVerified, 'Both fields emailVerified are the same')
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
        var fields = 'accountId,email,emailCode,kA,verifierVersion,verifyHash,authSalt'.split(',')
        fields.forEach(function(f) {
          t.equal(user.account[f], account[f], 'Both Fields ' + f + ' are the same')
        })
        t.equal(user.account.emailVerified, !!account.emailVerified, 'Both fields emailVerified are the same')
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
        t.equal(!!token.emailVerified, user.account.emailVerified)
        t.equal(token.email, user.account.email)
        t.deepEqual(token.emailCode, user.account.emailCode)
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
  'teardown',
  function (t) {
    t.plan(1)
    testServer.stop()
    t.equal(testServer.server.killed, true, 'test server has been killed')
    t.end()
  }
)
