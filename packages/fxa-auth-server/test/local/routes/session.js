/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const assert = require('insist')
const getRoute = require('../../routes_helpers').getRoute
const mocks = require('../../mocks')
const P = require('../../../lib/promise')
const sinon = require('sinon')

function makeRoutes (options) {
  options = options || {}
  const db = options.db || mocks.mockDB()
  const log = options.log || mocks.mockLog()
  return require('../../../lib/routes/session')(log, db)
}

function runTest (route, request) {
  return new P((resolve, reject) => {
    route.handler(request, response => {
      if (response instanceof Error) {
        reject(response)
      } else {
        resolve(response)
      }
    })
  })
}

describe('/session/status', () => {
  const log = mocks.mockLog()
  const config = {}
  const routes = makeRoutes({ log, config })
  const route = getRoute(routes, '/session/status')
  const request = mocks.mockRequest({
    credentials: {
      email: 'foo@example.org',
      state: 'unverified',
      uid: 'foo'
    }
  })

  it('returns status correctly', () => {
    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 2)
      assert.equal(res.uid, 'foo')
      assert.equal(res.state, 'unverified')
    })
  })

})


describe('/session/destroy', () => {
  let route
  let request
  let log
  let db

  beforeEach(() => {
    db = mocks.mockDB()
    log = mocks.mockLog()
    const config = {}
    const routes = makeRoutes({ log, config, db})
    route = getRoute(routes, '/session/destroy')
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'foo'
      },
      log: log
    })
  })

  it('responds correctly when session is destroyed', () => {
    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 0)
    })
  })

  it('responds correctly when custom session is destroyed', () => {
    db.sessionToken = sinon.spy(function () {
      return P.resolve({
        uid: 'foo'
      })
    })
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'foo'
      },
      log: log,
      payload: {
        customSessionToken: 'foo'
      }
    })

    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 0)
    })
  })

  it('throws on invalid session token', () => {
    db.sessionToken = sinon.spy(function () {
      return P.resolve({
        uid: 'diff-user'
      })
    })
    request = mocks.mockRequest({
      credentials: {
        email: 'foo@example.org',
        uid: 'foo'
      },
      log: log,
      payload: {
        customSessionToken: 'foo'
      }
    })

    return runTest(route, request).then(assert, (err) => {
      assert.equal(err.message, 'Invalid session token')
    })
  })

})

describe('/session/duplicate', () => {
  let route
  let request
  let log
  let db

  beforeEach(() => {
    db = mocks.mockDB({
    })
    log = mocks.mockLog()
    const config = {}
    const routes = makeRoutes({log, config, db})
    route = getRoute(routes, '/session/duplicate')
    request = mocks.mockRequest({
      credentials: {
        uid: 'foo',
        createdAt: 234567,
        email: 'foo@example.org',
        emailCode: 'abcdef',
        emailVerified: true,
        tokenVerified: true,
        verifierSetAt: 123456,
        locale: 'en-AU',
        uaBrowser: 'Firefox',
        uaBrowserVersion: '49',
        uaOS: 'Windows',
        uaOSVersion: '10',
        uaDeviceType: 'mobile',
        uaFormFactor: 'frobble'
      },
      log: log,
      uaBrowser: 'Chrome',
      uaBrowserVersion: '12',
      uaOS: 'iOS',
      uaOSVersion: '7',
      uaDeviceType: 'desktop',
      uaFormFactor: 'womble'
    })
  })

  it('correctly duplicates a session token', () => {
    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 4, 'response has correct number of keys')
      assert.equal(res.uid, request.auth.credentials.uid, 'response includes correctly-copied uid')
      assert.ok(res.sessionToken, 'response includes a sessionToken')
      assert.equal(res.authAt, request.auth.credentials.createdAt, 'response includes correctly-copied auth timestamp')
      assert.equal(res.verified, true, 'response includes correctly-copied verification flag')

      assert.equal(db.createSessionToken.callCount, 1, 'db.createSessionToken was called once')
      const sessionTokenOptions = db.createSessionToken.args[0][0]
      assert.equal(Object.keys(sessionTokenOptions).length, 14, 'was called with correct number of options')
      assert.equal(sessionTokenOptions.uid, 'foo', 'db.createSessionToken called with correct uid')
      assert.equal(sessionTokenOptions.createdAt, 234567, 'db.createSessionToken called with correct createdAt')
      assert.equal(sessionTokenOptions.email, 'foo@example.org', 'db.createSessionToken called with correct email')
      assert.equal(sessionTokenOptions.emailCode, 'abcdef', 'db.createSessionToken called with correct emailCode')
      assert.equal(sessionTokenOptions.emailVerified, true, 'db.createSessionToken called with correct emailverified')
      assert.equal(sessionTokenOptions.verifierSetAt, 123456, 'db.createSessionToken called with correct verifierSetAt')
      assert.equal(sessionTokenOptions.locale, 'en-AU', 'db.createSessionToken called with correct locale')
      assert.ok(! sessionTokenOptions.mustVerify, 'db.createSessionToken called with falsy mustVerify')
      assert.equal(sessionTokenOptions.tokenVerificationId, undefined, 'db.createSessionToken called with correct tokenVerificationId')
      assert.equal(sessionTokenOptions.tokenVerificationCode, undefined, 'db.createSessionToken called with correct tokenVerificationCode')
      assert.equal(sessionTokenOptions.tokenVerificationCodeExpiresAt, undefined, 'db.createSessionToken called with correct tokenVerificationCodeExpiresAt')
      assert.equal(sessionTokenOptions.uaBrowser, 'Chrome', 'db.createSessionToken called with correct uaBrowser')
      assert.equal(sessionTokenOptions.uaBrowserVersion, '12', 'db.createSessionToken called with correct uaBrowserVersion')
      assert.equal(sessionTokenOptions.uaOS, 'iOS', 'db.createSessionToken called with correct uaOS')
      assert.equal(sessionTokenOptions.uaOSVersion, '7', 'db.createSessionToken called with correct uaOSVersion')
      assert.equal(sessionTokenOptions.uaDeviceType, 'desktop', 'db.createSessionToken called with correct uaDeviceType')
      assert.equal(sessionTokenOptions.uaFormFactor, 'womble', 'db.createSessionToken called with correct uaFormFactor')
    })
  })

  it('correctly generates new codes for unverified sessions', () => {
    request.auth.credentials.tokenVerified = false
    request.auth.credentials.tokenVerificationId = 'myCoolId'
    request.auth.credentials.tokenVerificationCode = 'myAwesomerCode'
    request.auth.credentials.tokenVerificationCodeExpiresAt = Date.now() + 10000
    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 6, 'response has correct number of keys')
      assert.equal(res.uid, request.auth.credentials.uid, 'response includes correctly-copied uid')
      assert.ok(res.sessionToken, 'response includes a sessionToken')
      assert.equal(res.authAt, request.auth.credentials.createdAt, 'response includes correctly-copied auth timestamp')
      assert.equal(res.verified, false, 'response includes correctly-copied verification flag')
      assert.equal(res.verificationMethod, 'email', 'response includes correct verification method')
      assert.equal(res.verificationReason, 'login', 'response includes correct verification reason')

      assert.equal(db.createSessionToken.callCount, 1, 'db.createSessionToken was called once')
      const sessionTokenOptions = db.createSessionToken.args[0][0]
      assert.equal(Object.keys(sessionTokenOptions).length, 17, 'was called with correct number of options')
      assert.equal(sessionTokenOptions.uid, 'foo', 'db.createSessionToken called with correct uid')
      assert.equal(sessionTokenOptions.createdAt, 234567, 'db.createSessionToken called with correct createdAt')
      assert.equal(sessionTokenOptions.email, 'foo@example.org', 'db.createSessionToken called with correct email')
      assert.equal(sessionTokenOptions.emailCode, 'abcdef', 'db.createSessionToken called with correct emailCode')
      assert.equal(sessionTokenOptions.emailVerified, true, 'db.createSessionToken called with correct emailverified')
      assert.equal(sessionTokenOptions.verifierSetAt, 123456, 'db.createSessionToken called with correct verifierSetAt')
      assert.equal(sessionTokenOptions.locale, 'en-AU', 'db.createSessionToken called with correct locale')
      assert.ok(! sessionTokenOptions.mustVerify, 'db.createSessionToken called with falsy mustVerify')
      assert.ok(sessionTokenOptions.tokenVerificationId, 'db.createSessionToken called with a truthy tokenVerificationId')
      assert.notEqual(sessionTokenOptions.tokenVerificationId, 'myCoolId', 'db.createSessionToken called with a new tokenVerificationId')
      assert.ok(sessionTokenOptions.tokenVerificationCode, 'db.createSessionToken called with a truthy tokenVerificationCode')
      assert.notEqual(sessionTokenOptions.tokenVerificationCode, 'myAwesomerCode', 'db.createSessionToken called with a new tokenVerificationCode')
      assert.equal(sessionTokenOptions.tokenVerificationCodeExpiresAt, 0, 'db.createSessionToken called with correct tokenVerificationCodeExpiresAt')
      assert.equal(sessionTokenOptions.uaBrowser, 'Chrome', 'db.createSessionToken called with correct uaBrowser')
      assert.equal(sessionTokenOptions.uaBrowserVersion, '12', 'db.createSessionToken called with correct uaBrowserVersion')
      assert.equal(sessionTokenOptions.uaOS, 'iOS', 'db.createSessionToken called with correct uaOS')
      assert.equal(sessionTokenOptions.uaOSVersion, '7', 'db.createSessionToken called with correct uaOSVersion')
      assert.equal(sessionTokenOptions.uaDeviceType, 'desktop', 'db.createSessionToken called with correct uaDeviceType')
      assert.equal(sessionTokenOptions.uaFormFactor, 'womble', 'db.createSessionToken called with correct uaFormFactor')
    })
  })

  it('correctly reports verification reason for unverified emails', () => {
    request.auth.credentials.emailVerified = false
    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 6, 'response has correct number of keys')
      assert.equal(res.uid, request.auth.credentials.uid, 'response includes correctly-copied uid')
      assert.ok(res.sessionToken, 'response includes a sessionToken')
      assert.equal(res.authAt, request.auth.credentials.createdAt, 'response includes correctly-copied auth timestamp')
      assert.equal(res.verified, false, 'response includes correctly-copied verification flag')
      assert.equal(res.verificationMethod, 'email', 'response includes correct verification method')
      assert.equal(res.verificationReason, 'signup', 'response includes correct verification reason')
    })
  })

})
