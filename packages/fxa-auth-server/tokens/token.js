/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = function (log, crypto, P, hkdf, error) {

  function Token() {
    this.id = null
    this.hmacKey = null
    this.xorKey = null
    this._key = null
    this.algorithm = 'sha256'
    this.uid = null
    this.data = null
  }

  Token.hkdf = hkdf

  Token.random32Bytes = function () {
    var d = P.defer()
    // capturing the domain here is a workaround for:
    // https://github.com/joyent/node/issues/3965
    // this will be fixed in node v0.12
    var domain = process.domain
    crypto.randomBytes(
      32,
      function (err, bytes) {
        if (domain) domain.enter()
        var x = err ? d.reject(err) : d.resolve(bytes)
        if (domain) domain.exit()
        return x
      }
    )
    return d.promise
  }

  // `token.key` is used by Hawk, and should be a Buffer.
  // We store the hex-string so a getter is convenient
  Object.defineProperty(
    Token.prototype,
    'key',
    {
      get: function () { return Buffer(this._key, 'hex') },
      set: function (x) { this._key = x.toString('hex') }
    }
  )

  Token.randomTokenData = function (info, size) {
    return Token.random32Bytes()
      .then(Token.tokenDataFromBytes.bind(null, info, size))
  }

  Token.tokenDataFromBytes = function (info, size, bytes) {
    return hkdf(bytes, info, null, size)
      .then(
        function (key) {
          return [bytes, key]
        }
      )
  }

  Token.createFromHKDF = function (km, info) {
    return hkdf(km, info, null, 2 * 32)
      .then(
        function (key) {
          var t = new Token()
          t.hmacKey = key.slice(0, 32).toString('hex')
          t.xorKey = key.slice(32, 64).toString('hex')
          return t
        }
      )
  }

  Token.prototype.unbundle = function (hex) {
    log.trace({ op: 'Token.unbundle' })
    var b = Buffer(hex, 'hex')
    var ciphertext = b.slice(0, 32)
    var hmac = b.slice(32, 64)
    if (this.hmac(ciphertext).toString('hex') !== hmac.toString('hex')) {
      throw error.invalidSignature()
    }
    var plaintext = this.xor(ciphertext)
    return plaintext.slice(0, 32).toString('hex')
  }

  Token.prototype.hmac = function (buffer) {
    var hmac = crypto.createHmac('sha256', Buffer(this.hmacKey, 'hex'))
    hmac.update(buffer)
    return hmac.digest()
  }

  Token.prototype.appendHmac = function (buffer) {
    return Buffer.concat([buffer, this.hmac(buffer)])
  }

  Token.prototype.xor = function (buffer) {
    var xorBuffer = Buffer(this.xorKey, 'hex')
    if (buffer.length !== xorBuffer.length) {
      throw new Error(
        'XOR buffers must be same length %d != %d',
        buffer.length,
        xorBuffer.length
      )
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

  Token.prototype.bundleHexStrings = function (hexStrings) {
    var ciphertext = this.xor(Buffer.concat(hexStrings.map(hexToBuffer)))
    return this.appendHmac(ciphertext).toString('hex')
  }

  return Token
}
