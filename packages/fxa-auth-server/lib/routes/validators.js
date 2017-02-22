/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var url = require('url')
var punycode = require('punycode')
var isA = require('joi')

// Match any non-empty hex-encoded string.
module.exports.HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

// Match an encoded JWT.
module.exports.BASE64_JWT = /^(?:[a-zA-Z0-9-_]+[=]{0,2}\.){2}[a-zA-Z0-9-_]+[=]{0,2}$/

module.exports.URLSAFEBASE64 = /^[a-zA-Z0-9-_]*$/

module.exports.BASE_36 = /^[a-zA-Z0-9]*$/

// Crude phone number validation. The handler code does it more thoroughly.
exports.E164_NUMBER = /^\+[1-9]\d{1,14}$/

// Match display-safe unicode characters.
// We're pretty liberal with what's allowed in a unicode string,
// but we exclude the following classes of characters:
//
//   \u0000-\u001F  - C0 (ascii) control characters
//   \u007F         - ascii DEL character
//   \u0080-\u009F  - C1 (ansi escape) control characters
//   \u2028-\u2029  - unicode line/paragraph separator
//   \uD800-\uDFFF  - non-BMP surrogate pairs
//   \uE000-\uF8FF  - BMP private use area
//   \uFFF9-\uFFFF  - unicode "specials" block
//
// We might tweak this list in future.

const DISPLAY_SAFE_UNICODE = /^(?:[^\u0000-\u001F\u007F\u0080-\u009F\u2028-\u2029\uD800-\uDFFF\uE000-\uF8FF\uFFF9-\uFFFF])*$/
module.exports.DISPLAY_SAFE_UNICODE = DISPLAY_SAFE_UNICODE


// Joi validator to match any valid email address.
// This is different to Joi's builtin email validator, and
// requires a custom validation function.

// The custom validators below need to either return the value
// or create an error object using `createError`.
// see examples here: https://github.com/hapijs/joi/blob/master/lib/string.js

module.exports.email = function() {
  var email = isA.string().max(255).regex(DISPLAY_SAFE_UNICODE)
  // Imma add a custom test to this Joi object using internal
  // properties because I can't find a nice API to do that.
  email._tests.push({ func: function(value, state, options) {
    if (value !== undefined && value !== null) {
      if (module.exports.isValidEmailAddress(value)) {
        return value
      }
    }

    return email.createError('string.base', { value }, state, options)

  }})

  return email
}

module.exports.service = isA.string().max(16).regex(/^[a-zA-Z0-9\-]*$/g)


// Function to validate an email address.
// This is a transliteration of the HTML5 email-validation logic
// inside Firefox.  It splits the username and domain portions,
// translates tham into IDN punycode syntax, then does some very
// basic sanity-checking.

module.exports.isValidEmailAddress = function(value) {
  // It cant be empty or end with strange chars.
  if (! value) {
    return false
  }
  if (value[value.length - 1] === '.' || value[value.length - 1] === '-') {
    return false
  }
  // It must contain an '@' somewhere in the middle.
  var atPos = value.indexOf('@')
  if (atPos === -1 || atPos === 0 || atPos === value.length) {
    return false
  }
  var username = value.substring(0, atPos)
  var domain = value.substring(atPos + 1)
  // Unicode is hard, let's work with ascii only.
  username = punycode.toASCII(username)
  domain = punycode.toASCII(domain)
  // The username portion must contain only allowed characters.
  for (var i = 0; i < username.length; i++) {
    if (! username[i].match(/[a-zA-Z0-9.!#$%&'*+-\/=?^_`{|}~]/)) {
      return false
    }
  }
  // The domain portion can't begin with a dot or a dash.
  if (domain[0] === '.' || domain[0] === '-') {
    return false
  }
  var hasDot = false
  // The domain portion must be a valid punycode domain.
  for (i = 0; i < domain.length; i++) {
    if (domain[i] === '.') {
      hasDot = true
      // A dot can't follow a dot or a dash.
      if (domain[i - 1] === '.' || domain[i - 1] === '-') {
        return false
      }
    }
    else if (domain[i] === '-') {
      // A dash can't follow a dot.
      if (domain[i - 1] === '.') {
        return false
      }
    } else if (! domain[i].match(/[a-zA-Z0-9-]/)) {
      // The domain characters must be alphanumeric.
      return false
    }
  }
  // Even though the RFC doesn't require it, we need a dot. See:
  // https://github.com/mozilla/fxa-auth-server/issues/1193
  return hasDot
}

module.exports.redirectTo = function (base) {
  var redirectTo = isA.string().max(512)
  if (! base) { return redirectTo }
  var regex = new RegExp('(?:\\.|^)' + base.replace('.', '\\.') + '$')
  redirectTo._tests.push(
    {
      func: function(value, state, options) {
        if (value !== undefined && value !== null) {
          if (module.exports.isValidUrl(value, regex)) {
            return value
          }
        }

        return redirectTo.createError('string.base', { value }, state, options)
      }
    }
  )
  return redirectTo
}

module.exports.isValidUrl = function (redirect, regex) {
  var parsed = url.parse(redirect)
  return regex.test(parsed.hostname) && /^https?:$/.test(parsed.protocol)
}
