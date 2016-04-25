/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Shared helpers for mocking things out in the tests.
 */

var sinon = require('sinon')
var extend = require('util')._extend

// A logging mock that doesn't capture anything.
// You can pass in an object of custom logging methods
// if you need to e.g. make assertions about logged values.

var LOG_METHOD_NAMES = ['trace', 'increment', 'info', 'error', 'begin', 'warn',
                        'activityEvent', 'event']

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


module.exports = {
  mockLog: mockLog,
  spyLog: spyLog
}
