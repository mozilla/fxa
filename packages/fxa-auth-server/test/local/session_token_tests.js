/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
var sinon = require('sinon')
var log = { trace: function() {}, info: function () {} }
var crypto = require('crypto')

const config = {
  lastAccessTimeUpdates: {}
}
const tokens = require('../../lib/tokens')(log, config)
var SessionToken = tokens.SessionToken

var TOKEN_FRESHNESS_THRESHOLD = require('../../lib/tokens/session_token').TOKEN_FRESHNESS_THREADHOLD

var ACCOUNT = {
  createdAt: Date.now(),
  uid: 'xxx',
  email: Buffer('test@example.com').toString('hex'),
  emailCode: '123456',
  emailVerified: true,
  tokenVerificationId: crypto.randomBytes(16)
}

describe('SessionToken', () => {
  it(
    'interface is correct',
    () => {
      return SessionToken.create(ACCOUNT)
        .then(function (token) {
          assert.equal(typeof token.lastAuthAt, 'function', 'lastAuthAt method is defined')
          assert.equal(typeof token.update, 'function', 'update method is defined')
          assert.equal(typeof token.isFresh, 'function', 'isFresh method is defined')
          assert.equal(typeof token.setUserAgentInfo, 'function', 'setUserAgentInfo method is defined')
        })
    }
  )

  it(
    're-creation from tokenData works',
    () => {
      var token = null
      return SessionToken.create(ACCOUNT)
        .then(
          function (x) {
            token = x
            assert.equal(token.accountCreatedAt, ACCOUNT.createdAt)
          }
        )
        .then(
          function () {
            return SessionToken.fromHex(token.data, ACCOUNT)
          }
        )
        .then(
          function (token2) {
            assert.deepEqual(token.data, token2.data)
            assert.deepEqual(token.id, token2.id)
            assert.deepEqual(token.authKey, token2.authKey)
            assert.deepEqual(token.bundleKey, token2.bundleKey)
            assert.deepEqual(token.uid, token2.uid)
            assert.equal(token.email, token2.email)
            assert.equal(token.emailCode, token2.emailCode)
            assert.equal(token.emailVerified, token2.emailVerified)
            assert.equal(token.accountCreatedAt, token2.accountCreatedAt)
            assert.equal(token.tokenVerified, token2.tokenVerified)
            assert.equal(token.tokenVerificationId, token2.tokenVerificationId)
          }
        )
    }
  )

  it(
    'create with NaN createdAt',
    () => {
      return SessionToken.create({
        createdAt: NaN,
        email: 'foo',
        uid: 'bar'
      }).then(
        function (token) {
          var now = Date.now()
          assert.ok(token.createdAt > now - 1000 && token.createdAt <= now)
          assert.equal(token.accountCreatedAt, null)
        }
      )
    }
  )

  it(
    'sessionToken key derivations are test-vector compliant',
    () => {
      var token = null
      var tokenData = 'a0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebf'
      return SessionToken.fromHex(tokenData, ACCOUNT)
        .then(
          function (x) {
            token = x
            assert.equal(token.data.toString('hex'), tokenData)
            assert.equal(token.id.toString('hex'), 'c0a29dcf46174973da1378696e4c82ae10f723cf4f4d9f75e39f4ae3851595ab')
            assert.equal(token.authKey.toString('hex'), '9d8f22998ee7f5798b887042466b72d53e56ab0c094388bf65831f702d2febc0')
          }
        )
    }
  )

  it(
    'SessionToken.setUserAgentInfo',
    () => {
      return SessionToken.create(ACCOUNT)
        .then(function (token) {
          token.setUserAgentInfo({
            data: 'foo',
            tokenId: 'foo',
            authKey: 'foo',
            bundleKey: 'foo',
            algorithm: 'foo',
            uid: 'foo',
            lifetime: 'foo',
            createdAt: 'foo',
            email: 'foo',
            emailCode: 'foo',
            emailVerified: 'foo',
            verifierSetAt: 'foo',
            locale: 'foo',
            accountCreatedAt: 'foo',
            uaBrowser: 'foo',
            uaBrowserVersion: 'bar',
            uaOS: 'baz',
            uaOSVersion: 'qux',
            uaDeviceType: 'wibble',
            lastAccessTime: 'mnngh'
          })
          assert.notEqual(token.data, 'foo', 'data was not updated')
          assert.notEqual(token.tokenId, 'foo', 'tokenId was not updated')
          assert.notEqual(token.authKey, 'foo', 'authKey was not updated')
          assert.notEqual(token.bundleKey, 'foo', 'bundleKey was not updated')
          assert.notEqual(token.algorithm, 'foo', 'algorithm was not updated')
          assert.notEqual(token.uid, 'foo', 'uid was not updated')
          assert.notEqual(token.lifetime, 'foo', 'lifetime was not updated')
          assert.notEqual(token.createdAt, 'foo', 'createdAt was not updated')
          assert.notEqual(token.email, 'foo', 'email was not updated')
          assert.notEqual(token.emailVerified, 'foo', 'emailVerified was not updated')
          assert.notEqual(token.verifierSetAt, 'foo', 'verifierSetAt was not updated')
          assert.notEqual(token.locale, 'foo', 'locale was not updated')
          assert.notEqual(token.accountCreatedAt, 'foo', 'accountCreatedAt was not updated')
          assert.equal(token.uaBrowser, 'foo', 'uaBrowser was updated')
          assert.equal(token.uaBrowserVersion, 'bar', 'uaBrowserVersion was updated')
          assert.equal(token.uaOS, 'baz', 'uaOS was updated')
          assert.equal(token.uaOSVersion, 'qux', 'uaOSVersion was updated')
          assert.equal(token.uaDeviceType, 'wibble', 'uaDeviceType was updated')
          assert.equal(token.lastAccessTime, 'mnngh', 'lastAccessTime was updated')
        })
    }
  )

  it(
    'SessionToken.isFresh with lastAccessTime updates enabled',
    () => {
      config.lastAccessTimeUpdates.enabled = true
      config.lastAccessTimeUpdates.sampleRate = 1
      config.lastAccessTimeUpdates.enabledEmailAddresses = /.+/
      return SessionToken.create({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaDeviceType: 'wibble',
        lastAccessTime: 0
      }).then(token => {
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: 0
        }), true, 'returns true when all fields are the same')
        assert.equal(token.isFresh({
          uaBrowser: 'Foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: 0
        }), false, 'returns false when uaBrowser is different')
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'baR',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: 0
        }), false, 'returns false when uaBrowserVersion is different')
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'foo',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: 0
        }), false, 'returns false when uaOS is different')
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'QUX',
          uaDeviceType: 'wibble',
          lastAccessTime: 0
        }), false, 'returns false when uaOSVersion is different')
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wobble',
          lastAccessTime: 0
        }), false, 'returns false when uaDeviceType is different')
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: TOKEN_FRESHNESS_THRESHOLD
        }), false, 'returns false when lastAccessTime is TOKEN_FRESHNESS_THRESHOLD milliseconds newer')
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: 3599999
        }), true, 'returns true when lastAccessTime is 3,599,999 milliseconds newer')
      })
    }
  )

  it(
    'SessionToken.isFresh with lastAccessTime updates disabled',
    () => {
      config.lastAccessTimeUpdates.enabled = false
      return SessionToken.create({
        uaBrowser: 'foo',
        uaBrowserVersion: 'bar',
        uaOS: 'baz',
        uaOSVersion: 'qux',
        uaDeviceType: 'wibble',
        lastAccessTime: 0
      }).then(token => {
        assert.equal(token.isFresh({
          uaBrowser: 'foo',
          uaBrowserVersion: 'bar',
          uaOS: 'baz',
          uaOSVersion: 'qux',
          uaDeviceType: 'wibble',
          lastAccessTime: TOKEN_FRESHNESS_THRESHOLD
        }), true, 'returns true when lastAccessTime is TOKEN_FRESHNESS_THRESHOLD milliseconds newer')
      })
    }
  )

  it(
    'SessionToken.update on fresh token',
    () => {
      return SessionToken.create(
      ).then(function (token) {
        sinon.stub(SessionToken.prototype, 'isFresh', function () {
          return true
        })
        sinon.spy(SessionToken.prototype, 'setUserAgentInfo')

        assert.equal(
          token.update(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0'
          ), false, 'returns'
        )

        assert.equal(SessionToken.prototype.isFresh.callCount, 1, 'isFresh was called once')
        assert.equal(SessionToken.prototype.isFresh.thisValues[0], token, 'isFresh context was token')
        var isFreshArgs = SessionToken.prototype.isFresh.args[0]
        assert.equal(isFreshArgs.length, 1, 'isFresh was passed one argument')
        var isFreshData = isFreshArgs[0]
        assert.equal(typeof isFreshData, 'object', 'isFresh was passed an object')
        assert.equal(Object.keys(isFreshData).length, 6, 'isFresh data had six properties')
        assert.equal(isFreshData.uaBrowser, 'Firefox', 'uaBrowser was correct')
        assert.equal(isFreshData.uaBrowserVersion, '41', 'uaBrowserVersion was correct')
        assert.equal(isFreshData.uaOS, 'Mac OS X', 'uaOS was correct')
        assert.equal(isFreshData.uaOSVersion, '10.10', 'uaOSVersion was correct')
        assert.equal(isFreshData.uaDeviceType, null, 'uaDeviceType was correct')
        assert.ok(isFreshData.lastAccessTime > Date.now() - 10000, 'lastAccessTime was greater than 10 seconds ago')
        assert.ok(isFreshData.lastAccessTime < Date.now(), 'lastAccessTime was less then Date.now()')

        assert.equal(SessionToken.prototype.setUserAgentInfo.callCount, 0, 'setUserAgentInfo was not called')
      })
      .finally(function () {
        SessionToken.prototype.isFresh.restore()
        SessionToken.prototype.setUserAgentInfo.restore()
      })
    }
  )

  it(
    'SessionToken.update on stale token',
    () => {
      return SessionToken.create()
        .then(function (token) {
          sinon.stub(SessionToken.prototype, 'isFresh', function () {
            return false
          })
          sinon.spy(SessionToken.prototype, 'setUserAgentInfo')

          assert.equal(
            token.update(
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:41.0) Gecko/20100101 Firefox/41.0'
            ), true, 'returns true'
          )

          assert.equal(SessionToken.prototype.isFresh.callCount, 1, 'isFresh was called once')
          var isFreshArgs = SessionToken.prototype.setUserAgentInfo.args[0]
          assert.equal(isFreshArgs.length, 1, 'isFresh was passed one argument')

          assert.equal(SessionToken.prototype.setUserAgentInfo.callCount, 1, 'setUserAgentInfo called once')
          assert.equal(SessionToken.prototype.setUserAgentInfo.thisValues[0], token, 'setUserAgentInfo context was token')
          var setUserAgentInfoArgs = SessionToken.prototype.setUserAgentInfo.args[0]
          assert.equal(setUserAgentInfoArgs.length, 1, 'setUserAgentInfo was passed one argument')
          assert.deepEqual(setUserAgentInfoArgs[0], isFreshArgs[0], 'setUserAgentInfo was passed correct argument')
        })
        .finally(function () {
          SessionToken.prototype.isFresh.restore()
          SessionToken.prototype.setUserAgentInfo.restore()
        })
    }
  )
})
