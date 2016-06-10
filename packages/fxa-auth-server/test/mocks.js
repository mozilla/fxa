/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Shared helpers for mocking things out in the tests.
 */

var sinon = require('sinon')
var extend = require('util')._extend
var P = require('../lib/promise')
var crypto = require('crypto')

// A logging mock that doesn't capture anything.
// You can pass in an object of custom logging methods
// if you need to e.g. make assertions about logged values.

var LOG_METHOD_NAMES = ['trace', 'increment', 'info', 'error', 'begin', 'warn',
                        'activityEvent', 'event']

var METRICS_CONTEXT_METHOD_NAMES = ['add', 'validate']

var mockLog = function(methods) {
  var log = extend({}, methods)
  LOG_METHOD_NAMES.forEach(function(name) {
    if (!log[name]) {
      log[name] = function() {}
    }
  })
  return log
}

// A logging mock where all logging methods are sinon spys,
// and we capture a log of all their calls in order.

var spyLog = function(methods) {
  methods = extend({}, methods)
  methods.messages = methods.messages || []
  LOG_METHOD_NAMES.forEach(function(name) {
    if (!methods[name]) {
      methods[name] = function() {
        this.messages.push({
          level: name,
          args: Array.prototype.slice.call(arguments)
        })
      }
    }
    methods[name] = sinon.spy(methods[name])
  })
  return mockLog(methods)
}

var mockMailer = function () {
  return {
    sendVerifyCode: sinon.spy(function () {
      return P.resolve()
    }),
    sendVerifyLoginEmail: sinon.spy(function () {
      return P.resolve()
    }),
    sendNewDeviceLoginNotification: sinon.spy(function () {
      return P.resolve()
    })
  }
}

var mockRequest = function (email, keys) {
  return {
    app: {
      acceptLangage: 'en-US'
    },
    headers: {
      'user-agent': 'test-user-agent'
    },
    query: {
      keys: keys
    },
    payload: {
      email: email,
      authPW: crypto.randomBytes(32).toString('hex'),
      service: 'sync',
      reason: 'signin',
      metricsContext: {context:'fx_desktop_v3'}
    }
  }
}

var mockDB = function (uid, email, verified) {
  return {
    emailRecord: sinon.spy(function () {
      return P.resolve({
        authSalt: new Buffer(crypto.randomBytes(32), 'hex'),
        email: email,
        emailVerified: verified,
        kA: new Buffer(crypto.randomBytes(32), 'hex'),
        uid: uid,
        wrapWrapKb: new Buffer(crypto.randomBytes(32), 'hex')
      })
    }),
    createSessionToken: sinon.spy(function () {
      return P.resolve({
        uid: uid,
        email: email,
        emailVerified: verified,
        tokenVerificationId: (verified ? undefined : crypto.randomBytes(16)),
        tokenVerified: (verified ? true : false),
        data: crypto.randomBytes(32),
        lastAuthAt: function () {
          return 0
        }
      })
    }),
    createKeyFetchToken: sinon.spy(function () {
      return P.resolve({
        data: crypto.randomBytes(32)
      })
    }),
    sessions: sinon.spy(function () {
      return P.resolve([{}, {}, {}])
    })
  }
}
function mockObject (methodNames) {
  return function (methods) {
    return methodNames.reduce(function (object, name) {
      object[name] = methods && methods[name] || sinon.spy(function () {
        return P.resolve()
      })

      return object
    }, {})
  }
}

module.exports = {
  mockLog: mockLog,
  spyLog: spyLog,
  mockDB: mockDB,
  mockMailer: mockMailer,
  mockRequest: mockRequest,
  mockMetricsContext: mockObject(METRICS_CONTEXT_METHOD_NAMES)
}
