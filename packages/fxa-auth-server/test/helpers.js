/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * A pair of helper functions for closing of a promise chain in the
 * tests.  They make it easier to ensure that any unhandled errors
 * cause the test to file.  Use like so:
 *
 *    someAPI.thingThatReturnsPromise()
 *      .then(function(result) {
 *         t.assertEqual(result, 42)
 *      })
 *      .done(helpers.succeed(t), helpers.fail(t))
 *
 * XXX TODO: it would be nice to have even less boilerplate for this!
 */

module.exports.succeed = function(t) {
  return function() {
    t.end()
  }
}

module.exports.fail = function(t) {
  return function(err) {
    t.fail(err)
    t.end()
  }
}
