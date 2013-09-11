/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var scrypt = require('../../client/scrypt')
var P = require('p-promise')
var test = require('tap').test

test(
  'scrypt basic with a remote helper',
  function (t) {
    function end() { t.end() }

    var K1 = Buffer('f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd', 'hex')
    var salt = Buffer('identity.mozilla.com/picl/v1/scrypt')
    var helper = 'https://scrypt.dev.lcip.org/'

    scrypt.hash(K1, salt, helper)
      .then(
      function (K2) {
        t.equal(K2, '5b82f146a64126923e4167a0350bb181feba61f63cb1714012b19cb0be0119c5')
      }
    )
      .done(end, end)
  }
)

test(
  'scrypt basic with a local helper',
  function (t) {
    function end() { t.end() }

    var K1 = Buffer('f84913e3d8e6d624689d0a3e9678ac8dcc79d2c2f3d9641488cd9d6ef6cd83dd', 'hex')
    var salt = Buffer('identity.mozilla.com/picl/v1/scrypt')

    scrypt.hash(K1, salt)
      .then(
      function (K2) {
        t.equal(K2, '5b82f146a64126923e4167a0350bb181feba61f63cb1714012b19cb0be0119c5')
      }
    )
      .done(end, end)
  }
)
