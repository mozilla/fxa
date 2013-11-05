/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*  Base class for handling various types of token.
 * 
 *  This module provides the basic functionality for handling authentication
 *  tokens.  There are different types of token for use in different contexts
 *  but they all operate in essentially the same way:
 *
 *    - Each token is created from an initial data seed of 32 random bytes.
 *
 *    - From the seed data we HKDF-derive three 32-byte values: a tokenid,
 *      an authKey and a bundleKey.
 *
 *    - The tokenid/authKey pair can be used as part of a request-signing
 *      authentication scheme.
 *
 *    - The bundleKey can be used to encrypt data as part of the request.
 *
 *    - The token may have additional metadata details such as uid or email,
 *      which are specific to the type of token.
 *
 */

module.exports = function (log, crypto, P, hkdf, Bundle, error) {

  // Token constructor.
  // 
  // This directly populates the token from its keys and metadata details.
  // You probably want to call a helper rather than use this directly.
  //
  function Token(keys, details) {
    this.data = keys.data
    this.id = keys.id
    this.authKey = keys.authKey
    this.bundleKey = keys.bundleKey
    this.algorithm = 'sha256'
    this.uid = details.uid || null
  }

  // Create a new token of the given type.
  // This uses randomly-generated seed data to derive the keys.
  //
  Token.createNewToken = function(TokenType, details) {
    var d = P.defer()
    // capturing the domain here is a workaround for:
    // https://github.com/joyent/node/issues/3965
    // this will be fixed in node v0.12
    var domain = process.domain
    crypto.randomBytes(
      32,
      function (err, bytes) {
        if (domain) domain.enter()
        if (err) {
          d.reject(err)
        } else {
          Token.deriveTokenKeys(TokenType, bytes)
            .then(
              function (keys) {
                d.resolve(new TokenType(keys, details || {}))
              }
            )
            .fail(
              function (err) {
                d.reject(err)
              }
            )
        }
        if (domain) domain.exit()
      }
    )
    return d.promise
  }


  // Re-create an existing token of the given type.
  // This uses known seed data to derive the keys.
  //
  Token.createTokenFromHexData = function(TokenType, hexData, details) {
    var d = P.defer()
    var data = Buffer(hexData, 'hex')
    Token.deriveTokenKeys(TokenType, data)
      .then(
        function (keys) {
          d.resolve(new TokenType(keys, details || {}))
        }
      )
      .fail(
        function (err) {
          d.reject(err)
        }
      )
    return d.promise
  }


  // Derive tokenid, authKey and bundleKey from token seed data.
  //
  Token.deriveTokenKeys = function (TokenType, data) {
    return hkdf(data, TokenType.tokenTypeID, null, 3 * 32)
      .then(
        function (keyMaterial) {
          return {
            data: data.toString('hex'),
            id: keyMaterial.slice(0, 32).toString('hex'),
            authKey: keyMaterial.slice(32, 64).toString('hex'),
            bundleKey: keyMaterial.slice(64, 96).toString('hex')
          }
        }
      )
  }


  // Convenience method to bundle a payload using token bundleKey.
  //
  Token.prototype.bundle = function(keyInfo, payload) {
    log.trace({ op: 'Token.bundle' })
    return Bundle.bundle(Buffer(this.bundleKey, 'hex'), keyInfo, payload)
  }


  // Convenience method to unbundle a payload using token bundleKey.
  //
  Token.prototype.unbundle = function(keyInfo, payload) {
    log.trace({ op: 'Token.unbundle' })
    return Bundle.unbundle(Buffer(this.bundleKey, 'hex'), keyInfo, payload)
  }


  // `token.key` is used by Hawk, and should be a Buffer.
  // We store the hex-string so a getter is convenient
  Object.defineProperty(
    Token.prototype,
    'key',
    {
      get: function () { return Buffer(this.authKey, 'hex') },
      set: function (x) { this.authKey = x.toString('hex') }
    }
  )

  return Token
}
