/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * Shared helpers for mocking things out in the tests.
 */


// A logging mock that doesn't capture anything.
// You can pass in an object of custom logging methods
// if you need to e.g. capture messages.


var mockLog = function(methods) {
  var log = {}
  var noop = function () {}
  methods = methods || {}
  ;['trace', 'increment', 'info', 'error'].forEach(function(name) {
    log[name] = (methods[name] || noop).bind(log)
  })
  return log
}

module.exports = {
  mockLog: mockLog
}
