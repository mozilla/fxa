/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var test = require('../ptaptest')
var log = { stat: function(){} }
var config = {}
var Password = require('../../crypto/password')(log, config)

test(
  'password version zero',
  function (t) {
    var pwd = Buffer('aaaaaaaaaaaaaaaa')
    var salt = Buffer('bbbbbbbbbbbbbbbb')
    var p1 = new Password(pwd, salt, 0);
    t.equal(p1.version, 0, 'should be using version zero')
    var p2 = new Password(pwd, salt, 0);
    t.equal(p2.version, 0, 'should be using version zero')
    return p1.verifyHash()
    .then(
      function (hash) {
        return p2.matches(hash)
      }
    )
    .then(
      function (matched) {
        t.ok(matched, 'identical passwords should match')
      }
    )
  }
)

test(
  'password version one',
  function (t) {
    var pwd = Buffer('aaaaaaaaaaaaaaaa')
    var salt = Buffer('bbbbbbbbbbbbbbbb')
    var p1 = new Password(pwd, salt, 1);
    t.equal(p1.version, 1, 'should be using version one')
    var p2 = new Password(pwd, salt, 1);
    t.equal(p2.version, 1, 'should be using version one')
    return p1.verifyHash()
    .then(
      function (hash) {
        return p2.matches(hash)
      }
    )
    .then(
      function (matched) {
        t.ok(matched, 'identical passwords should match')
      }
    )
  }
)

test(
  'passwords of different versions should not match',
  function (t) {
    var pwd = Buffer('aaaaaaaaaaaaaaaa')
    var salt = Buffer('bbbbbbbbbbbbbbbb')
    var p1 = new Password(pwd, salt, 0);
    var p2 = new Password(pwd, salt, 1);
    return p1.verifyHash()
    .then(
      function (hash) {
        return p2.matches(hash)
      }
    )
    .then(
      function (matched) {
        t.ok(!matched, 'passwords should not match')
      }
    )
  }
)
