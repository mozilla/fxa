/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('tap').test
var crypto = require('crypto')
var log = { trace: function() {} }

var tokens = require('../../tokens')(log)
var AccountResetToken = tokens.AccountResetToken

test(
  'bundle / unbundle works',
  function (t) {
    function end() { t.end() }
    AccountResetToken.create('xxx')
      .then(
        function (x) {
          var wrapKb = crypto.randomBytes(32).toString('hex')
          var verifier = crypto.randomBytes(256).toString('hex')
          var b = x.bundle(wrapKb, verifier)
          var ub = x.unbundle(b)
          t.equal(ub.wrapKb, wrapKb)
          t.equal(ub.verifier, verifier)
          return x
        }
      )
      .then(
        function (x) {
          return x.del()
        }
      )
      .done(end, end)
  }
)
