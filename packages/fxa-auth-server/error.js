var Hoek = require('hapi').utils;
var Boom = require('hapi').error

var DEFAULTS = {
  message: 'Unspecified error',
  info: 'https://github.com/mozilla/picl-idp/blob/master/docs/api.md#response-format'
}

Boom.wrap = function (object) {
  object = Hoek.applyToDefaults(DEFAULTS, object)
  var b = new Boom(object.code, object.message)
  Hoek.merge(b.response.payload, object);
  return b
}

Boom.accountExists = function (email) {
  return Boom.wrap({
    code: 400,
    errno: 101,
    message: 'Account already exists',
    email: email
  })
}

Boom.unknownAccount = function (email) {
  return Boom.wrap({
    code: 400,
    errno: 102,
    message: 'Unknown account',
    email: email
  })
}

Boom.incorrectPassword = function () {
  return Boom.wrap({
    code: 400,
    errno: 103,
    message: 'Incorrect password'
  })
}

Boom.unverifiedAccount = function () {
  return Boom.wrap({
    code: 400,
    errno: 104,
    message: 'Unverified account'
  })
}

Boom.invalidVerificationCode = function (details) {
  return Boom.wrap(Hoek.merge({
    code: 400,
    errno: 105,
    message: 'Invalid verification code'
  }, details));
}

Boom.invalidRequestBody = function () {
  return Boom.wrap({
    code: 400,
    errno: 106,
    message: 'Invalid JSON in request body'
  })
}

Boom.invalidRequestParameter = function (param) {
  return Boom.wrap({
    code: 400,
    errno: 107,
    message: 'Invalid parameter in request body' + (param ? ': ' + param : ''),
    param: param
  })
}

Boom.missingRequestParameter = function (param) {
  return Boom.wrap({
    code: 400,
    errno: 108,
    message: 'Missing parameter in request body' + (param ? ': ' + param : ''),
    param: param
  })
}

Boom.invalidSignature = function () {
  return Boom.wrap({
    code: 401,
    errno: 109,
    message: 'Invalid request signature'
  })
}

Boom.invalidToken = function () {
  return Boom.wrap({
    code: 401,
    errno: 110,
    message: 'Invalid authentication token in request signature'
  })
}

Boom.invalidTimestamp = function () {
  return Boom.wrap({
    code: 401,
    errno: 111,
    message: 'Invalid timestamp in request signature'
  })
}

Boom.missingContentLength = function () {
  return Boom.wrap({
    code: 411,
    errno: 112,
    message: 'Missing content-length header'
  })
}

Boom.requestBodyTooLarge = function () {
  return Boom.wrap({
    code: 413,
    errno: 113,
    message: 'Request body too large'
  })
}

Boom.tooManyRequests = function () {
  return Boom.wrap({
    code: 429,
    errno: 114,
    message: 'Client has sent too many requests'
  })
}

Boom.serviceUnavailable = function () {
  return Boom.wrap({
    code: 503,
    errno: 201,
    message: 'Service unavailable'
  })
}

module.exports = Boom
