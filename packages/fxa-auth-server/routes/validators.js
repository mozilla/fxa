/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var url = require('url')
var punycode = require('punycode')
var isA = require('hapi').types

// Match any non-empty hex-encoded string.

module.exports.HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/


// Joi validator to match any valid email address.
// This is different to Joi's builtin email validator, and
// requires a custom validation function.

module.exports.email = function() {
  var email = isA.string().max(255)
  // Imma add a custom test to this Joi object using internal
  // properties because I can't find a nice API to do that.
  email._tests.push({ func: function(value, state, options) {
    if (value !== undefined && value !== null) {
      if (module.exports.isValidEmailAddress(value)) {
        return null
      }
    }
    return {
      type: 'validators.email',
      context: { key: '<root>' },
      path: state.path
    }
  }})
  return email
}


// Function to validate an email address.
// This is a transliteration of the HTML5 email-validation logic
// inside Firefox.  It splits the username and domain portions,
// translates tham into IDN punycode syntax, then does some very
// basic sanity-checking.

module.exports.isValidEmailAddress = function(value) {
  // It cant be empty or end with strange chars.
  if (!value) {
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
    if (!username[i].match(/[a-zA-Z0-9.!#$%&'*+-\/=?^_`{|}~]/)) {
      return false
    }
  }
  // The domain portion can't begin with a dot or a dash.
  if (domain[0] === '.' || domain[0] === '-') {
    return false
  }
  // The domain portion must be a valid punycode domain.
  for (i = 0; i < domain.length; i++) {
    if (domain[i] === '.') {
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
    } else if (!domain[i].match(/[a-zA-Z0-9-]/)) {
      // The domain characters must be alphanumeric.
      return false
    }
  }
  return true
}

module.exports.redirectTo = function (base) {
  var redirectTo = isA.string().max(512)
  if (!base) { return redirectTo }
  var regex = new RegExp('(?:\\.|^)' + base.replace('.', '\\.') + '$')
  redirectTo._tests.push(
    {
      func: function(value, state, options) {
        if (value !== undefined && value !== null) {
          if (module.exports.isValidUrl(value, regex)) {
            return null
          }
        }
        return {
          type: 'validators.redirectTo',
          context: { key: '<root>' },
          path: state.path
        }
      }
    }
  )
  return redirectTo
}

module.exports.isValidUrl = function (redirect, regex) {
  var parsed = url.parse(redirect)
  return regex.test(parsed.hostname) && /^https?:$/.test(parsed.protocol)
}
