/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX = /^(?:[a-fA-F0-9]{2})+$/

module.exports.unbuffer = function unbuffer(object, inplace) {
  var keys = Object.keys(object)
  var copy = inplace ? object : {}
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]]
    copy[keys[i]] = Buffer.isBuffer(x) ? x.toString('hex') : x
  }
  return copy
}

module.exports.bufferize = function bufferize(object, options) {
  var keys = Object.keys(object)
  options = options || {}
  var copy = options.inplace ? object : {}
  var ignore = options.ignore || []
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var value = object[key]
    if (
      ignore.indexOf(key) === -1 &&
      typeof value === 'string' &&
      HEX.test(value)
    ) {
      copy[key] = Buffer(value, 'hex')
    } else {
      copy[key] = value
    }
  }
  return copy
}
