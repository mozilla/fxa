/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')

var sinon = require('sinon')

var test = require('../ptaptest')
var mocks = require('../mocks')

var P = require('../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var isA = require('joi')
var error = require('../../lib/error')

var TEST_EMAIL_INVALID = 'example@dotless-domain'

var makeRoutes = function (options) {
  options = options || {}

  var config = options.config || {
    smtp: {}
  }
  var log = options.log || mocks.mockLog()
  var Password = require('../../lib/crypto/password')(log, config)
  return require('../../lib/routes/account')(
    log,
    crypto,
    P,
    uuid,
    isA,
    error,
    options.db || {},
    options.mailer || {},
    Password,
    config
  )
}

var getRoute = function (routes, path) {
  var route = null

  routes.some(function (r) {
    if (r.path === path) {
      route = r
      return true
    }
  })

  return route
}

test(
  'account with unverified invalid email gets deleted on status poll',
  function (t) {
    var mockDB = {
      deleteAccount: sinon.spy(function() {
        return P.resolve()
      })
    }
    var mockRequest = {
      auth: {
        credentials: {
          email: TEST_EMAIL_INVALID,
          emailVerified: false
        }
      }
    }

    var accountRoutes = makeRoutes({
      db: mockDB
    })
    var route = getRoute(accountRoutes, '/recovery_email/status')

    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
    .then(function(response) {
      t.equal(mockDB.deleteAccount.callCount, 1)
      t.equal(mockDB.deleteAccount.firstCall.args[0].email, TEST_EMAIL_INVALID)
      t.equal(response.errno, error.ERRNO.INVALID_TOKEN)
    })
  }
)

test(
  'account with verified invalid email does not get deleted on status poll',
  function (t) {
    var mockDB = {
      deleteAccount: sinon.spy()
    }
    var mockRequest = {
      auth: {
        credentials: {
          email: TEST_EMAIL_INVALID,
          emailVerified: true
        }
      }
    }

    var accountRoutes = makeRoutes({
      db: mockDB
    })
    var route = getRoute(accountRoutes, '/recovery_email/status')

    return new P(function(resolve) {
      route.handler(mockRequest, function(response) {
        resolve(response)
      })
    })
    .then(function(response) {
      t.equal(mockDB.deleteAccount.callCount, 0)
      t.deepEqual(response, {
        email: TEST_EMAIL_INVALID,
        verified: true
      })
    })
  }
)
