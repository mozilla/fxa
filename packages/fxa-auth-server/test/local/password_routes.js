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

var makeRoutes = function (options) {
  options = options || {}

  var config = options.config || {
    verifierVersion: 0,
    smtp: {}
  }
  var log = options.log || mocks.mockLog()
  var db = options.db || {}
  var Password = require('../../lib/crypto/password')(log, config)
  var customs = options.customs || {}
  var checkPassword = require('../../lib/routes/utils/password_check')(log, config, Password, customs, db)
  return require('../../lib/routes/password')(
    log,
    isA,
    error,
    db,
    Password,
    config.smtp.redirectDomain || '',
    options.mailer || {},
    config.verifierVersion,
    options.customs || {},
    checkPassword,
    options.push || {}
  )
}

test(
  'device should be notified when the password is changed',
  function (t) {
    var uid = uuid.v4('binary')
    var mockRequest = {
      auth: {
        credentials: {
          uid: uid.toString('hex')
        }
      },
      payload: {
        authPW: crypto.randomBytes(32).toString('hex'),
        wrapKb: crypto.randomBytes(32).toString('hex')
      },
      app: {}
    }
    var mockDB = {
      deletePasswordChangeToken: sinon.spy(function () {
        return P.resolve()
      }),
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
    var mockPush = {
      notifyUpdate: sinon.spy(function () {})
    }
    var mockMailer = {
      sendPasswordChangedNotification: sinon.spy(function () {
        return P.resolve()
      })
    }
    var passwordRoutes = makeRoutes({
      db: mockDB,
      push: mockPush,
      mailer: mockMailer
    })

    return new P(function(resolve) {
      getRoute(passwordRoutes, '/password/change/finish')
        .handler(mockRequest, function(response) {
          resolve(response)
        })
    })
    .then(function(response) {
      t.equal(mockDB.deletePasswordChangeToken.callCount, 1)
      t.equal(mockDB.resetAccount.callCount, 1)

      t.equal(mockPush.notifyUpdate.callCount, 1)
      t.equal(mockPush.notifyUpdate.firstCall.args[0], uid.toString('hex'))
      t.equal(mockPush.notifyUpdate.firstCall.args[1], 'passwordChange')

      t.equal(mockDB.account.callCount, 1)
      t.equal(mockMailer.sendPasswordChangedNotification.callCount, 1)
      t.equal(mockMailer.sendPasswordChangedNotification.firstCall.args[0], TEST_EMAIL)
    })
  }
)
