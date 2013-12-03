/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A promise-ified version of tap.test.
 *
 * This module provides a 'test' function that operates just like tap.test, but
 * will properly close a promise if the test returns one.  This makes it easier
 * to ensure that any unhandled errors cause the test to fail.  Use like so:
 *
 *    var test = require('./ptap')
 *
 *    test(
 *      'an example test',
 *      function (t) {
 *        return someAPI.thingThatReturnsPromise()
 *        .then(function(result) {
 *           t.assertEqual(result, 42)
 *        })
 *      }
 *    )
 *
 *  Because the test function returns a promise, we get the following for free:
 *
 *    * wait for the promise to resolve, and call t.end() when it does
 *    * check for unhandled errors and fail the test if they occur
 *
 */

var tap = require('tap')

module.exports = function(name, testfunc) {
  var wrappedtestfunc = function(t) {
    var res = testfunc(t)
    if (typeof res !== 'undefined') {
      if (typeof res.done === 'function') {
        res.done(
          function() {
            t.end()
          },
          function(err) {
            t.fail(err.message || err.error || err)
            t.end()
          }
        )
      }
    }
  }
  return tap.test(name, wrappedtestfunc)
}
