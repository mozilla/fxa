/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (crypto, P, hkdf) {

  function Bundle() {
    this.hmacKey = null
    this.xorKey = null
  }

  Bundle.random32Bytes = function () {
    var d = P.defer()
    crypto.randomBytes(
      32,
      function (err, bytes) {
        return err ? d.reject(err) : d.resolve(bytes)
      }
    )
    return d.promise
  }

  Bundle.hkdf = hkdf

  Bundle.prototype.hmac = function (buffer) {
    var hmac = crypto.createHmac('sha256', Buffer(this.hmacKey, 'hex'))
    hmac.update(buffer)
    return hmac.digest()
  }

  Bundle.prototype.appendHmac = function (buffer) {
    return Buffer.concat([buffer, this.hmac(buffer)])
  }

  Bundle.prototype.xor = function (buffer) {
    var xorBuffer = Buffer(this.xorKey, 'hex')
    if (buffer.length !== xorBuffer.length) {
      throw new Error('XOR buffers must be same length')
    }
    var result = Buffer(xorBuffer.length)
    for (var i = 0; i < xorBuffer.length; i++) {
      result[i] = buffer[i] ^ xorBuffer[i]
    }
    return result
  }

  function hexToBuffer(string) {
    return Buffer(string, 'hex')
  }

  Bundle.prototype.bundleHexStrings = function (hexStrings) {
    var ciphertext = this.xor(Buffer.concat(hexStrings.map(hexToBuffer)))
    return this.appendHmac(ciphertext).toString('hex')
  }

  return Bundle
}
