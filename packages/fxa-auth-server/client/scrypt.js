/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('request')
var P = require('p-promise')
var scrypt = require('node-scrypt-js')


/**  hash Creates an scrypt hash
 *
 * @param {String} input The input for scrypt
 * @param {String} salt The salt for the hash
 * @param {String} url scrypt helper server url
 * @returns {Object} d.promise Deferred promise
 */
function hash(input, salt, url) {
  var p
  var payload = {
    salt: salt,
    N: 64 * 1024,
    r: 8,
    p: 1,
    buflen: 32,
    input: input
  }

  if (url) {
     p = remoteScryptHelper(payload, url)
  } else {
     p = localScrypt(payload)
  }

  return p
}

/** localScrypt generates the scrypt hash locally
 *
 * @param {Object} payload the payload required to generate the hash
 */
function localScrypt(payload) {
  var inputBinary = new Buffer(payload.input, "hex").toString("binary")
  var spass = scrypt.scrypt(inputBinary, payload.salt, payload.N, payload.r, payload.p, payload.buflen)
  var result = new Buffer(spass, 'base64').toString('hex')

  return P(result)
}

/** remoteScryptHelper generates the scrypt hash using a remote helper
 *
 * @param {Object} payload The payload required to generate the hash
 * @param {String} url The url of the remote helper
 */
function remoteScryptHelper(payload, url) {
  var d = P.defer()
  var method = 'POST'
  var headers = {}

  request(
    {
      url: url,
      method: method,
      headers: headers,
      json: payload
    },
    function (err, res, body) {
      if ((err || body.error)) {
        d.reject(err || body)
      }
      else {
        d.resolve(body.output)
      }
    }
  )

  return d.promise
}

module.exports.hash = hash
