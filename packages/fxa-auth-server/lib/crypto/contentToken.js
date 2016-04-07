/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var P = require('../promise')
var crypto = require('crypto')

var TOKEN_LENGTH = 66

/**
 *
 * @param {String} token Hex content token
 * @param {String} ip String Ip of the request
 * @param {Object} headers Request headers
 * @param {Object} contentTokenConfig Configuration object for the content token
 * @returns {Promise} resolve to 'true' if token is valid, 'false' if not.
 */
function validateContentToken(token, ip, headers, contentTokenConfig) {
  // if contentToken check is not required then we say check is valid
  if (! contentTokenConfig.required) {
    return P.resolve(true)
  }

  // allow certain Regex UAs
  if (contentTokenConfig.allowedUARegex) {
    var allowedUAs = contentTokenConfig.allowedUARegex.map(function(re) {
      return new RegExp(re);
    });

    var allowed = allowedUAs.some(function(re) {
      return re.test(headers['user-agent']);
    });

    if (allowed) {
      return P.resolve(true)
    }
  }

  if (! token || token.length !== TOKEN_LENGTH || ! ip || ! headers || ! contentTokenConfig) {
    return P.resolve(false)
  }

  // the first 26 chars are the timestamp
  var timestampString = new Buffer(token.substring(0, 26), 'hex').toString('utf8')

  // check if token is expired
  if (isNaN(Number(timestampString)) || (Date.now() - Number(timestampString) > contentTokenConfig.expiry)) {
    return P.resolve(false)
  }

  // the rest is HMAC
  var hmacContents = token.substring(26, 66)
  var contentTokenContentValidation = timestampString + ip + headers['user-agent']
  // Create HMAC from known data
  var hmacContentsValidation = crypto.createHmac('sha1', contentTokenConfig.key).update(contentTokenContentValidation).digest('hex')

  return P.resolve(hmacContents === hmacContentsValidation)
}

module.exports = validateContentToken
