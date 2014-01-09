/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var hkdf = require('./hkdf')
var scrypt = require('./scrypt')
var butil = require('./butil')

function stretch(authPW, authSalt) {
  return scrypt.hash(authPW, authSalt)
}

function verify(stretched, verifyHash) {
  return hkdf(stretched, 'verifyHash', null, 32)
    .then(
      function (hash) {
        if (!verifyHash) { return hash }
        return butil.buffersAreEqual(hash, verifyHash) ? hash : false
      }
    )
}

function verifyHash(authPW, authSalt) {
  return stretch(authPW, authSalt)
    .then(verify)
}

function wrapKb(stretched, wrapWrapKb) {
  return hkdf(stretched, 'wrapwrapKey', null, 32)
    .then(
      function (wrapwrapKey) {
        return butil.xorBuffers(wrapwrapKey, wrapWrapKb)
      }
    )
}

module.exports.verifyHash = verifyHash
module.exports.stretch = stretch
module.exports.verify = verify
module.exports.wrapKb = wrapKb
