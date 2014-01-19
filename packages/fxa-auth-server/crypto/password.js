/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var hkdf = require('./hkdf')
var scrypt = require('./scrypt')
var butil = require('./butil')

var hashVersions = {
  0: function (authPW, authSalt) {
    return P(butil.xorBuffers(authPW, authSalt))
  },
  1: function (authPW, authSalt) {
    return scrypt.hash(authPW, authSalt, 65536, 8, 1, 32)
  }
}

function Password(authPW, authSalt, version) {
  version = typeof(version) === 'number' ? version : 1
  this.authPW = authPW
  this.authSalt = authSalt
  this.version = version
  this.stretchPromise = hashVersions[version](authPW, authSalt)
  this.verifyHashPromise = this.stretchPromise.then(hkdfVerify)
}

Password.prototype.stretchedPassword = function () {
  return this.stretchPromise
}

Password.prototype.verifyHash = function () {
  return this.verifyHashPromise
}

Password.prototype.matches = function (verifyHash) {
  return this.verifyHash().then(
    function (hash) {
      return butil.buffersAreEqual(hash, verifyHash)
    }
  )
}

Password.prototype.wrapKb = function (wrapWrapKb) {
  return this.stretchedPassword().then(
    function (stretched) {
      return hkdf(stretched, 'wrapwrapKey', null, 32)
        .then(
          function (wrapwrapKey) {
            return butil.xorBuffers(wrapwrapKey, wrapWrapKb)
          }
        )
    }
  )
}

function hkdfVerify(stretched) {
  return hkdf(stretched, 'verifyHash', null, 32)
}


module.exports = Password
