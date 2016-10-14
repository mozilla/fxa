/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const test = require('../ptaptest')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

let hashResult = Array(40).fill('0')
const hash = {
  update: sinon.spy(),
  digest: sinon.spy(() => hashResult)
}
const crypto = {
  createHash: sinon.spy(() => hash)
}

const config = {
  lastAccessTimeUpdates: {},
  signinConfirmation: {},
  signinUnblock: {}
}

const features = proxyquire('../../lib/features', {
  crypto: crypto
})(config)

test(
  'interface is correct',
  t => {
    t.equal(typeof features, 'object', 'object type should be exported')
    t.equal(Object.keys(features).length, 4, 'object should have four properties')
    t.equal(typeof features.isSampledUser, 'function', 'isSampledUser should be function')
    t.equal(typeof features.isLastAccessTimeEnabledForUser, 'function', 'isLastAccessTimeEnabledForUser should be function')
    t.equal(typeof features.isSigninConfirmationEnabledForUser, 'function', 'isSigninConfirmationEnabledForUser should be function')
    t.equal(typeof features.isSigninUnblockEnabledForUser, 'function', 'isSigninUnblockEnabledForUser should be function')

    t.equal(crypto.createHash.callCount, 1, 'crypto.createHash should have been called once on require')
    let args = crypto.createHash.args[0]
    t.equal(args.length, 1, 'crypto.createHash should have been passed one argument')
    t.equal(args[0], 'sha1', 'crypto.createHash algorithm should have been sha1')

    t.equal(hash.update.callCount, 2, 'hash.update should have been called twice on require')
    args = hash.update.args[0]
    t.equal(args.length, 1, 'hash.update should have been passed one argument first time')
    t.equal(typeof args[0], 'string', 'hash.update data should have been a string first time')
    args = hash.update.args[1]
    t.equal(args.length, 1, 'hash.update should have been passed one argument second time')
    t.equal(typeof args[0], 'string', 'hash.update data should have been a string second time')

    t.equal(hash.digest.callCount, 1, 'hash.digest should have been called once on require')
    args = hash.digest.args[0]
    t.equal(args.length, 1, 'hash.digest should have been passed one argument')
    t.equal(args[0], 'hex', 'hash.digest ecnoding should have been hex')

    crypto.createHash.reset()
    hash.update.reset()
    hash.digest.reset()

    t.end()
  }
)

test(
  'isSampledUser',
  t => {
    let uid = Buffer.alloc(32, 0xff)
    let sampleRate = 1
    hashResult = Array(40).fill('f').join('')

    t.equal(features.isSampledUser(sampleRate, uid, 'foo'), true, 'should always return true if sample rate is 1')

    t.equal(crypto.createHash.callCount, 0, 'crypto.createHash should not have been called')
    t.equal(hash.update.callCount, 0, 'hash.update should not have been called')
    t.equal(hash.digest.callCount, 0, 'hash.digest should not have been called')

    sampleRate = 0
    hashResult = Array(40).fill('0').join('')

    t.equal(features.isSampledUser(sampleRate, uid, 'foo'), false, 'should always return false if sample rate is 0')

    t.equal(crypto.createHash.callCount, 0, 'crypto.createHash should not have been called')
    t.equal(hash.update.callCount, 0, 'hash.update should not have been called')
    t.equal(hash.digest.callCount, 0, 'hash.digest should not have been called')

    sampleRate = 0.05
    // First 27 characters are ignored, last 13 are 0.04 * 0xfffffffffffff
    hashResult = '0000000000000000000000000000a3d70a3d70a6'

    t.equal(features.isSampledUser(sampleRate, uid, 'foo'), true, 'should return true if sample rate is greater than the extracted cohort value')

    t.equal(crypto.createHash.callCount, 1, 'crypto.createHash should have been called once')
    let args = crypto.createHash.args[0]
    t.equal(args.length, 1, 'crypto.createHash should have been passed one argument')
    t.equal(args[0], 'sha1', 'crypto.createHash algorithm should have been sha1')

    t.equal(hash.update.callCount, 2, 'hash.update should have been called twice')
    args = hash.update.args[0]
    t.equal(args.length, 1, 'hash.update should have been passed one argument first time')
    t.equal(args[0], uid.toString('hex'), 'hash.update data should have been stringified uid first time')
    args = hash.update.args[1]
    t.equal(args.length, 1, 'hash.update should have been passed one argument second time')
    t.equal(args[0], 'foo', 'hash.update data should have been key second time')

    t.equal(hash.digest.callCount, 1, 'hash.digest should have been called once')
    args = hash.digest.args[0]
    t.equal(args.length, 1, 'hash.digest should have been passed one argument')
    t.equal(args[0], 'hex', 'hash.digest ecnoding should have been hex')

    crypto.createHash.reset()
    hash.update.reset()
    hash.digest.reset()

    sampleRate = 0.04

    t.equal(features.isSampledUser(sampleRate, uid, 'bar'), false, 'should return false if sample rate is equal to the extracted cohort value')

    t.equal(crypto.createHash.callCount, 1, 'crypto.createHash should have been called once')
    t.equal(hash.update.callCount, 2, 'hash.update should have been called twice')
    t.equal(hash.update.args[0][0], uid.toString('hex'), 'hash.update data should have been stringified uid first time')
    t.equal(hash.update.args[1][0], 'bar', 'hash.update data should have been key second time')
    t.equal(hash.digest.callCount, 1, 'hash.digest should have been called once')

    crypto.createHash.reset()
    hash.update.reset()
    hash.digest.reset()

    sampleRate = 0.03

    t.equal(features.isSampledUser(sampleRate, uid, 'foo'), false, 'should return false if sample rate is less than the extracted cohort value')

    crypto.createHash.reset()
    hash.update.reset()
    hash.digest.reset()

    uid = Array(64).fill('7').join('')
    sampleRate = 0.03
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852'

    t.equal(features.isSampledUser(sampleRate, uid, 'wibble'), true, 'should return true if sample rate is greater than the extracted cohort value')

    t.equal(hash.update.callCount, 2, 'hash.update should have been called twice')
    t.equal(hash.update.args[0][0], uid, 'hash.update data should have been stringified uid first time')
    t.equal(hash.update.args[1][0], 'wibble', 'hash.update data should have been key second time')

    crypto.createHash.reset()
    hash.update.reset()
    hash.digest.reset()

    t.end()
  }
)

test(
  'isLastAccessTimeEnabledForUser',
  t => {
    const uid = 'foo'
    const email = 'bar@mozilla.com'
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852'

    config.lastAccessTimeUpdates.enabled = true
    config.lastAccessTimeUpdates.sampleRate = 0
    config.lastAccessTimeUpdates.enabledEmailAddresses = /.+@mozilla\.com$/
    t.equal(features.isLastAccessTimeEnabledForUser(uid, email), true, 'should return true when email address matches')

    config.lastAccessTimeUpdates.enabledEmailAddresses = /.+@mozilla\.org$/
    t.equal(features.isLastAccessTimeEnabledForUser(uid, email), false, 'should return false when email address does not match')

    config.lastAccessTimeUpdates.sampleRate = 0.03
    t.equal(features.isLastAccessTimeEnabledForUser(uid, email), true, 'should return true when sample rate matches')

    config.lastAccessTimeUpdates.sampleRate = 0.02
    t.equal(features.isLastAccessTimeEnabledForUser(uid, email), false, 'should return false when sample rate does not match')

    config.lastAccessTimeUpdates.enabled = false
    config.lastAccessTimeUpdates.sampleRate = 0.03
    config.lastAccessTimeUpdates.enabledEmailAddresses = /.+@mozilla\.com$/
    t.equal(features.isLastAccessTimeEnabledForUser(uid, email), false, 'should return false when feature is disabled')

    t.end()
  }
)

test(
  'isSigninConfirmationEnabledForUser',
  t => {
    const uid = 'wibble'
    const email = 'blee@mozilla.com'
    const request = {
      app: {
        isSuspiciousRequest: true
      },
      payload: {
        metricsContext: {
          context: 'iframe'
        }
      }
    }
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852'

    config.signinConfirmation.enabled = true
    config.signinConfirmation.sample_rate = 0.03
    config.signinConfirmation.enabledEmailAddresses = /.+@mozilla\.com$/
    config.signinConfirmation.supportedClients = [ 'wibble', 'iframe' ]
    t.equal(features.isSigninConfirmationEnabledForUser(uid, email, request), true, 'should return true when request is suspicious')

    config.signinConfirmation.sample_rate = 0.02
    request.app.isSuspiciousRequest = false
    t.equal(features.isSigninConfirmationEnabledForUser(uid, email, request), true, 'should return true when email address matches')

    config.signinConfirmation.enabledEmailAddresses = /.+@mozilla\.org$/
    request.payload.metricsContext.context = 'iframe'
    t.equal(features.isSigninConfirmationEnabledForUser(uid, email, request), false, 'should return false when email address and sample rate do not match')

    config.signinConfirmation.sample_rate = 0.03
    t.equal(features.isSigninConfirmationEnabledForUser(uid, email, request), true, 'should return true when sample rate and context match')

    request.payload.metricsContext.context = ''
    t.equal(features.isSigninConfirmationEnabledForUser(uid, email, request), false, 'should return false when context does not match')

    config.signinConfirmation.enabled = false
    config.signinConfirmation.forceEmailRegex = /.+@mozilla\.com$/
    request.payload.metricsContext.context = 'iframe'
    t.equal(features.isSigninConfirmationEnabledForUser(uid, email, request), false, 'should return false when feature is disabled')

    t.end()
  }
)

test(
  'isSigninUnblockEnabledForUser',
  t => {
    const uid = 'wibble'
    const email = 'blee@mozilla.com'
    const request = {
      payload: {
        metricsContext: {
          context: 'iframe'
        }
      }
    }
    // First 27 characters are ignored, last 13 are 0.02 * 0xfffffffffffff
    hashResult = '000000000000000000000000000051eb851eb852'

    const unblock = config.signinUnblock

    unblock.enabled = true
    unblock.sampleRate = 0.02
    unblock.allowedEmailAddresses = /.+@notmozilla.com$/
    unblock.supportedClients = [ 'wibble', 'iframe' ]
    t.equal(features.isSigninUnblockEnabledForUser(uid, email, request), false, 'should return false when email is not allowed and uid is not sampled')

    unblock.forcedEmailAddresses = /.+/
    t.equal(features.isSigninUnblockEnabledForUser(uid, email, request), true, 'should return true when forced on')
    unblock.forcedEmailAddresses = /^$/

    unblock.allowedEmailAddresses = /.+@mozilla.com$/
    t.equal(features.isSigninUnblockEnabledForUser(uid, email, request), true, 'should return true when email is allowed')

    unblock.allowedEmailAddresses = /.+@notmozilla.com$/
    unblock.sampleRate = 0.03
    t.equal(features.isSigninUnblockEnabledForUser(uid, email, request), true, 'should return when uid is sampled')


    request.payload.metricsContext.context = ''
    t.equal(features.isSigninUnblockEnabledForUser(uid, email, request), false, 'should return false when context is not supported')


    request.payload.metricsContext.context = 'iframe'
    unblock.enabled = false
    t.equal(features.isSigninUnblockEnabledForUser(uid, email, request), false, 'should return false when feature is disabled')

    t.end()
  }
)

