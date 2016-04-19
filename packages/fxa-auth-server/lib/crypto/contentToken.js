/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var crypto = require('crypto')

var TOKEN_LENGTH = 66

/**
 *
 * @param {String} token Hex content token
 * @param {Object} headers Request headers
 * @param {Object} contentTokenConfig Configuration object for the content token
 * @returns {Promise} resolves Object 'valid' and 'reason'
 *
 */
function validateContentToken(token, headers, contentTokenConfig) {

  if (! contentTokenConfig || ! headers) {
    return P.resolve({
      valid: false,
      reason: 'Missing token config or headers'
    })
  }

  if (! token) {
    return P.resolve({
      valid: false,
      reason: 'Missing token'
    })
  }

  if (token.length !== TOKEN_LENGTH) {
    return P.resolve({
      valid: false,
      reason: 'Incorrect token length'
    })
  }

  // the first 26 chars are the timestamp
  var timestampString = new Buffer(token.substring(0, 26), 'hex').toString('utf8')
  if (isNaN(Number(timestampString))) {
    return P.resolve({
      valid: false,
      reason: 'Invalid token duration'
    })
  }

  // check if token is expired
  if ((Date.now() - Number(timestampString) > contentTokenConfig.expiry)) {
    return P.resolve({
      valid: false,
      reason: 'Token expired'
    })
  }

  // the rest is HMAC
  var hmacContents = token.substring(26, 66)
  var contentTokenContentValidation = timestampString + headers['user-agent']
  // Create HMAC from known data
  var hmacContentsValidation = crypto.createHmac('sha1', contentTokenConfig.key).update(contentTokenContentValidation).digest('hex')

  var valid = false
  var reason = 'Invalid HMAC'

  if (hmacContents === hmacContentsValidation) {
    valid = true
    reason = 'Valid HMAC'
  }

  return P.resolve({
    valid: valid,
    reason: reason
  })
}

module.exports = validateContentToken
