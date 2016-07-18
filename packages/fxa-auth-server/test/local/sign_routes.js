/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

require('ass')

var crypto = require('crypto')
var uuid = require('uuid')
var error = require('../../lib/error')
var getRoute = require('../routes_helpers').getRoute
var isA = require('joi')
var mocks = require('../mocks')
var P = require('../../lib/promise')
var test = require('../ptaptest')

test(
  '/certificate/sign',
  function (t) {
    var mockLog = mocks.spyLog()
    var mockRequest = mocks.mockRequest({
      credentials: {
        accountCreatedAt: Date.now(),
        deviceId: crypto.randomBytes(16),
        emailVerified: true,
        lastAuthAt: function () {
          return Date.now()
        },
        locale: 'en',
        tokenId: crypto.randomBytes(16),
        uid: uuid.v4('binary')
      },
      payload: {
        duration: 0,
        publicKey: {
          algorithm: 'RS',
          n: 'bar',
          e: 'baz'
        }
      },
      query: {}
    })
    var signRoutes = makeRoutes({
      config: {
        memcache: {
          address: '127.0.0.1:11211',
          idle: 100
        }
      },
      log: mockLog
    })

    return new P(function (resolve) {
      getRoute(signRoutes, '/certificate/sign')
        .handler(mockRequest, resolve)
    })
    .then(
      function () {
        t.equal(mockLog.activityEvent.callCount, 1)
        t.equal(mockLog.activityEvent.args[0].length, 3)
        t.equal(mockLog.activityEvent.args[0][0], 'account.signed')
        t.equal(mockLog.activityEvent.args[0][1], mockRequest)
        t.deepEqual(mockLog.activityEvent.args[0][2], {
          uid: mockRequest.auth.credentials.uid.toString('hex'),
          account_created_at: mockRequest.auth.credentials.accountCreatedAt,
          device_id: mockRequest.auth.credentials.deviceId.toString('hex')
        })
      },
      function () {
        t.fail('request should have succeeded')
      }
    )
  }
)

function makeRoutes (options) {
  options = options || {}

  var log = options.log || mocks.mockLog()
  var config = options.config || {}

  return require('../../lib/routes/sign')(
    log,
    isA,
    error,
    options.signer || {
      sign: function () {
        return P.resolve({})
      }
    },
    options.db || {
      updateSessionToken: function () {},
      updateLocale: function () {}
    },
    options.domain || 'wibble',
    options.metricsContext || require('../../lib/metrics/context')(log, config)
  )
}

