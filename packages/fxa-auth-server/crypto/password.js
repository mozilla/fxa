/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var hkdf = require('./hkdf')
var butil = require('./butil')

module.exports = function(log, config) {

  var scrypt = require('./scrypt')(log, config)

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

  Password.prototype.unwrap = function (wrapped, context) {
    context = context || 'wrapwrapKey'
    return this.stretchedPassword().then(
      function (stretched) {
        return hkdf(stretched, context, null, 32)
          .then(
            function (wrapper) {
              return butil.xorBuffers(wrapper, wrapped)
            }
          )
      }
    )
  }
  Password.prototype.wrap = Password.prototype.unwrap

  function hkdfVerify(stretched) {
    return hkdf(stretched, 'verifyHash', null, 32)
  }

  Password.stat = function () {
    // Reset the high-water-mark whenever it is read.
    var numPendingHWM = scrypt.numPendingHWM
    scrypt.numPendingHWM = scrypt.numPending
    return {
      stat: 'scrypt',
      maxPending: scrypt.maxPending,
      numPending: scrypt.numPending,
      numPendingHWM: numPendingHWM
    }
  }

  return Password
}
