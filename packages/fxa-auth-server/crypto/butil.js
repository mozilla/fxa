/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX = /^(?:[a-fA-F0-9]{2})+$/

module.exports.buffersAreEqual = function buffersAreEqual(buffer1, buffer2) {
  var mismatch = buffer1.length - buffer2.length
  if (mismatch) {
    return false
  }
  for (var i = 0; i < buffer1.length; i++) {
    mismatch |= buffer1[i] ^ buffer2[i]
  }
  return mismatch === 0
}

module.exports.xorBuffers = function xorBuffers(buffer1, buffer2) {
  if (buffer1.length !== buffer2.length) {
    throw new Error(
      'XOR buffers must be same length (%d != %d)',
      buffer1.length,
      buffer2.length
    )
  }
  var result = Buffer(buffer1.length)
  for (var i = 0; i < buffer1.length; i++) {
    result[i] = buffer1[i] ^ buffer2[i]
  }
  return result
}

module.exports.unbuffer = function unbuffer(object, inplace) {
  var keys = Object.keys(object)
  var copy = inplace ? object : {}
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]]
    copy[keys[i]] = Buffer.isBuffer(x) ? x.toString('hex') : x
  }
  return copy
}

module.exports.bufferize = function bufferize(object, inplace) {
  var keys = Object.keys(object)
  var copy = inplace ? object : {}
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]]
    copy[keys[i]] = (typeof(x) === 'string' && HEX.test(x)) ? Buffer(x, 'hex') : x
  }
  return copy
}
