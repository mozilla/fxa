var Boom = require('hapi').error

Boom.accountExists = function (email) {
  var b = new Boom(400, 'Account already exists')
  var p = b.response.payload
  p.errno = 101
  p.info = 'http://errors.lcip.org/todo/101'
  p.email = email
  return b
}

Boom.unknownAccount = function () {
  var b = new Boom(400, 'Unknown account')
  var p = b.response.payload
  p.errno = 102
  p.info = 'http://errors.lcip.org/todo/102'
  return b
}

Boom.incorrectPassword = function () {
  var b = new Boom(400, 'Incorrect password')
  var p = b.response.payload
  p.errno = 103
  p.info = 'http://errors.lcip.org/todo/103'
  return b
}

Boom.unverifiedAccount = function () {
  var b = new Boom(400, 'Unverified account')
  var p = b.response.payload
  p.errno = 104
  p.info = 'http://errors.lcip.org/todo/104'
  return b
}

Boom.notImplemented = function () {
  return new Boom(501, 'Not implemented')
}

Boom.invalidCode = function (forgotPasswordToken) {
  var b = new Boom(400, 'Invalid code')
  var p = b.response.payload
  p.errno = 105
  p.info = 'http://errors.lcip.org/todo/105'
  p.tries = forgotPasswordToken.tries
  p.ttl = forgotPasswordToken.ttl()
  return b
}

Boom.incorrectVerificationCode = function () {
  var b = new Boom(400, 'Incorrect verification code')
  var p = b.response.payload
  p.errno = 106
  p.info = 'http://errors.lcip.org/todo/106'
  return b
}

module.exports = Boom
