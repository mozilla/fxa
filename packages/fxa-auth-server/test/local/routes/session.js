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
  const log = mocks.spyLog()
  const config = {}
  const routes = makeRoutes({ log, config })
  const route = getRoute(routes, '/session/status')
  const request = mocks.mockRequest({
    credentials: {
      email: 'foo@example.org',
      uid: 'foo'
    }
  })

  it('returns uid correctly', () => {
    return runTest(route, request).then((res) => {
      assert.equal(Object.keys(res).length, 1)
      assert.equal(res.uid, 'foo')
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
    log = mocks.spyLog()
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
