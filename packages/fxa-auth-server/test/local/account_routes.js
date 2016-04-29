/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')

var sinon = require('sinon')

var test = require('../ptaptest')
var mocks = require('../mocks')
var getRoute = require('../routes_helpers').getRoute

var P = require('../../lib/promise')
var uuid = require('uuid')
var crypto = require('crypto')
var isA = require('joi')
var error = require('../../lib/error')

var TEST_EMAIL = 'foo@gmail.com'
var TEST_EMAIL_INVALID = 'example@dotless-domain'

var makeRoutes = function (options) {
  options = options || {}

  var config = options.config || {
    verifierVersion: 0,
    smtp: {},
    contentToken: {
      allowedUARegex: [],
      allowedEmailRegex: []
    }
  }
  var log = options.log || mocks.mockLog()
  var Password = require('../../lib/crypto/password')(log, config)
  var db = options.db || {}
  var isPreVerified = require('../../lib/preverifier')(error, config)
  var customs = options.customs || {}
  var checkPassword = require('../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  var push = options.push || require('../../lib/push')(log, db)
  return require('../../lib/routes/account')(
    log,
    crypto,
    P,
    uuid,
    isA,
    error,
    db,
    options.mailer || {},
    Password,
    config,
    customs,
    isPreVerified,
    checkPassword,
    push
  )
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

test(
  '/recovery_email/status logs query reason',
  function (t) {
    var pushCalled = false
    var mockLog = mocks.mockLog({
      increment: function (name) {
        if (name === 'recovery_email_reason.push') {
          pushCalled = true
        }
      }
    })
    var mockRequest = {
      auth: {
        credentials: {
          email: TEST_EMAIL,
          emailVerified: true
        }
      },
      query: {
        reason: 'push'
      }
    }
    var accountRoutes = makeRoutes({
      log: mockLog
    })

    getRoute(accountRoutes, '/recovery_email/status')
      .handler(mockRequest, function() {
        t.equal(pushCalled, true)
        t.end()
      })
  }
)

test(
  'device should be notified when the account is reset',
  function (t) {
    var uid = uuid.v4('binary')
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex')
        }
      },
      payload: {
        authPW: crypto.randomBytes(32).toString('hex')
      }
    }
    var mockDB = {
      resetAccount: sinon.spy(function () {
        return P.resolve()
      }),
      account: sinon.spy(function () {
        return P.resolve({
          uid: uid,
          verifierSetAt: 0,
          email: TEST_EMAIL
        })
      })
    }
    var mockCustoms = {
      reset: sinon.spy(function (email) {
        return P.resolve()
      })
    }
    var mockPush = {
      notifyUpdate: sinon.spy(function () {})
    }
    var accountRoutes = makeRoutes({
      db: mockDB,
      customs: mockCustoms,
      push: mockPush
    })

    return new P(function(resolve) {
      getRoute(accountRoutes, '/account/reset')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function(response) {
      t.equal(mockDB.resetAccount.callCount, 1)

      t.equal(mockPush.notifyUpdate.callCount, 1)
      t.equal(mockPush.notifyUpdate.firstCall.args[0], uid.toString('hex'))
      t.equal(mockPush.notifyUpdate.firstCall.args[1], 'passwordReset')

      t.equal(mockDB.account.callCount, 1)
      t.equal(mockCustoms.reset.callCount, 1)
    })
  }
)
