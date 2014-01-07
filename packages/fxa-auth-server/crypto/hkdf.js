/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HKDF = require('hkdf')
var P = require('p-promise')

function kw(name) {
  return 'identity.mozilla.com/picl/v1/' + name
}

function hkdf(km, info, salt, len) {
  var d = P.defer()
  var df = new HKDF('sha256', salt, km)
  df.derive(
    kw(info),
    len,
    function(key) {
      d.resolve(key)
    }
  )
  return d.promise
}

module.exports = hkdf
