/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../../promise')
var test = require('../ptaptest')
var MockLog = { info: function () { } }
var config = { lockoutEnabled: true }
var Password = require('../../crypto/password')(MockLog, config)

var triggersLockout = false;
var MockCustoms = {
  flag: function (clientAddress, emailRecord) {
    return P({ lockout: triggersLockout })
  }
}

var MockDB = {
  locked: {},
  isLocked: function (uid) {
    return !! this.locked[uid];
  },
  lockAccount: function(account) {
    MockDB.locked[account.uid] = true;
  }
}

var checkPassword = require('../../routes/utils/password_check')(MockLog, config, Password, MockCustoms, MockDB)

test(
  'password check with correct password',
  function (t) {
    var authPW = new Buffer('aaaaaaaaaaaaaaaa')
    var emailRecord = {
      uid: 'correct_password',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: new Buffer('bbbbbbbbbbbbbbbb')
    }

    var password = new Password(
        authPW, emailRecord.authSalt, emailRecord.verifierVersion);

    return password.verifyHash()
      .then(
        function (hash) {
          emailRecord.verifyHash = hash

          return checkPassword(emailRecord, authPW, '10.0.0.1')
        }
      )
      .then(
        function (matches) {
          t.ok(matches, 'password matches, checkPassword returns true')
        }
      )
  }
)

test(
  'password check with incorrect password that does not trigger lockout',
  function (t) {
    var authPW = new Buffer('aaaaaaaaaaaaaaaa')
    var emailRecord = {
      uid: 'not_locked',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: new Buffer('bbbbbbbbbbbbbbbb')
    }

    var password= new Password(
            authPW, emailRecord.authSalt, emailRecord.verifierVersion);

    return password.verifyHash()
      .then(
        function (hash) {
          emailRecord.verifyHash = hash

          var incorrectAuthPW = new Buffer('cccccccccccccccc')

          triggersLockout = false;
          return checkPassword(emailRecord, incorrectAuthPW, '10.0.0.1')
        }
      )
      .then(
        function (match) {
          t.equal(!!match, false, 'password does not match, checkPassword returns false')
          t.equal(MockDB.isLocked('not_locked'), false, 'account was not marked as locked');
        }
      )
  }
)

test(
  'password check with incorrect password that triggers lockout',
  function (t) {
    var authPW = new Buffer('aaaaaaaaaaaaaaaa')
    var emailRecord = {
      uid: 'locked',
      verifyHash: null,
      verifierVersion: 0,
      authSalt: new Buffer('bbbbbbbbbbbbbbbb')
    }

    var password= new Password(
            authPW, emailRecord.authSalt, emailRecord.verifierVersion);

    return password.verifyHash()
      .then(
        function (hash) {
          emailRecord.verifyHash = hash

          var incorrectAuthPW = new Buffer('cccccccccccccccc')

          triggersLockout = true;
          return checkPassword(emailRecord, incorrectAuthPW, '10.0.0.1')
        }
      )
      .then(
        function (match) {
          t.equal(!!match, false, 'password does not match, checkPassword returns false')
          t.equal(MockDB.isLocked('locked'), true, 'account was not marked as locked');
        }
      )
  }
)

