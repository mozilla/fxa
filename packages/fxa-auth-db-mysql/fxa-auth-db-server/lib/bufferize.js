/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

function unbuffer(object) {
  var keys = Object.keys(object)
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]]
    if (Buffer.isBuffer(x)) {
      object[keys[i]] = x.toString('hex')
    }
  }
  return object
}

function bufferize(object) {
  var keys = Object.keys(object)
  for (var i = 0; i < keys.length; i++) {
    var x = object[keys[i]]
    if (typeof(x) === 'string' && HEX_STRING.test(x)) {
      object[keys[i]] = Buffer(x, 'hex')
    }
  }
  return object
}

function bufferizeRequest(req, res, next) {
  if (req.body) { req.body = bufferize(req.body) }
  if (req.params) { req.params = bufferize(req.params) }
  next()
}

module.exports = {
  unbuffer: unbuffer,
  bufferize: bufferize,
  bufferizeRequest: bufferizeRequest
}
