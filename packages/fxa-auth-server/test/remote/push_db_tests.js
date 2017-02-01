/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var P = require('../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var base64url = require('base64url')
var proxyquire = require('proxyquire')
var log = { trace() {}, info() {} }

var config = require('../../config').getProperties()
var TestServer = require('../test_server')
var Token = require('../../lib/tokens')(log)
const DB = require('../../lib/db')(
  config,
  log,
  Token.error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

var zeroBuffer16 = Buffer('00000000000000000000000000000000', 'hex')
var zeroBuffer32 = Buffer('0000000000000000000000000000000000000000000000000000000000000000', 'hex')

var SESSION_TOKEN_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0'
var ACCOUNT = {
  uid: uuid.v4('binary'),
  email: 'push' + Math.random() + '@bar.com',
  emailCode: zeroBuffer16,
  emailVerified: false,
  verifierVersion: 1,
  verifyHash: zeroBuffer32,
  authSalt: zeroBuffer32,
  kA: zeroBuffer32,
  wrapWrapKb: zeroBuffer32,
  tokenVerificationId: zeroBuffer16
}
var mockLog = {
  error: function () {
  },
  increment: function () {
  },
  trace: function () {
  },
  info: function () {
  }
}

describe('remote push db', function() {
  this.timeout(15000)

  let dbServer, db
  before(() => {
    return TestServer.start(config)
      .then(s => {
        dbServer = s
        return DB.connect(config[config.db.backend])
      })
      .then(x => {
        db = x
      })
  })

  it(
    'push db tests',
    () => {
      var sessionTokenId
      var deviceInfo = {
        id: crypto.randomBytes(16),
        name: 'my push device',
        type: 'mobile',
        pushCallback: 'https://foo/bar',
        pushPublicKey: base64url(Buffer.concat([Buffer.from('\x04'), crypto.randomBytes(64)])),
        pushAuthKey: base64url(crypto.randomBytes(16))
      }
      // two tests below, first for unknown 400 level error the device push info will stay the same
      // second, for a known 400 error we reset the device
      var mocksKnown400 = {
        'web-push': {
          sendNotification: function (endpoint, params) {
            var err = new Error('Failed 400 level')
            err.statusCode = 410
            return P.reject(err)
          }
        }
      }
      var mocksUnknown400 = {
        'web-push': {
          sendNotification: function (endpoint, params) {
            var err = new Error('Failed 429 level')
            err.statusCode = 429
            return P.reject(err)
          }
        }
      }

      return db.createAccount(ACCOUNT)
          .then(function() {
            return db.emailRecord(ACCOUNT.email)
          })
          .then(function(emailRecord) {
            emailRecord.createdAt = Date.now()
            return db.createSessionToken(emailRecord, SESSION_TOKEN_UA)
          })

          .then(function (sessionToken) {
            sessionTokenId = sessionToken.tokenId
            return db.createDevice(ACCOUNT.uid, sessionTokenId, deviceInfo)
          })
          .then(function (device) {
            assert.equal(device.name, deviceInfo.name)
            assert.equal(device.pushCallback, deviceInfo.pushCallback)
            assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey)
            assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey)
          })
          .then(function () {
            return db.devices(ACCOUNT.uid)
          })

          .then(function () {
            var pushWithUnknown400 = proxyquire('../../lib/push', mocksUnknown400)(mockLog, db, {})
            return pushWithUnknown400.pushToAllDevices(ACCOUNT.uid, 'accountVerify')
          })
          .then(function () {
            return db.devices(ACCOUNT.uid)
          })
          .then(function (devices) {
            var device = devices[0]
            assert.equal(device.name, deviceInfo.name)
            assert.equal(device.pushCallback, deviceInfo.pushCallback)
            assert.equal(device.pushPublicKey, deviceInfo.pushPublicKey, 'device.pushPublicKey is correct')
            assert.equal(device.pushAuthKey, deviceInfo.pushAuthKey, 'device.pushAuthKey is correct')
          })

          .then(function () {
            var pushWithKnown400 = proxyquire('../../lib/push', mocksKnown400)(mockLog, db, {})
            return pushWithKnown400.pushToAllDevices(ACCOUNT.uid, 'accountVerify')
          })
          .then(function () {
            return db.devices(ACCOUNT.uid)
          })
          .then(function (devices) {
            var device = devices[0]
            assert.equal(device.name, deviceInfo.name)
            assert.equal(device.pushCallback, '')
            assert.equal(device.pushPublicKey, '', 'device.pushPublicKey is correct')
            assert.equal(device.pushAuthKey, '', 'device.pushAuthKey is correct')
          })
    }
  )

  after(() => {
    return P.all([
      TestServer.stop(dbServer),
      db.close()
    ])
  })
})
