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
 * @returns {Promise} resolve to 'true' if token is valid, 'false' if not.
 */
function validateContentToken(token, headers, contentTokenConfig) {
  // if contentToken check is not required then we say check is valid
  if (! contentTokenConfig.required) {
    return P.resolve({
      valid: true,
      reason: 'Token verification not enabled'
    })
  }

  // allow certain Regex UAs
  if (contentTokenConfig.compiledRegexList) {
    var allowed = contentTokenConfig.compiledRegexList.some(function(re) {
      return re.test(headers['user-agent'])
    })

    if (allowed) {
      return P.resolve({
        valid: true,
        reason: 'Allowed user agent'
      })
    }
  }

  if (! token || token.length !== TOKEN_LENGTH || ! headers || ! contentTokenConfig) {
    return P.resolve({
      valid: false,
      reason: 'Bad request or token length'
    })
  }

  // the first 26 chars are the timestamp
  var timestampString = new Buffer(token.substring(0, 26), 'hex').toString('utf8')

  // check if token is expired
  if (isNaN(Number(timestampString)) || (Date.now() - Number(timestampString) > contentTokenConfig.expiry)) {
    return P.resolve({
      valid: false,
      reason: 'Content token expired or bad duration'
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
