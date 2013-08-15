var Boom = require('hapi').error

Boom.accountExists = function (email) {
  var b = new Boom(400)
  b.appError = {
    code: 400,
    error: 101,
    message: 'Account already exists',
    info: 'http://errors.lcip.org/todo/101',
    email: email
  }
  return b
}

Boom.unknownAccount = function () {
  var b = new Boom(400)
  b.appError = {
    code: 400,
    error: 102,
    message: 'Unknown account',
    info: 'http://errors.lcip.org/todo/102'
  }
  return b
}

Boom.incorrectPassword = function () {
  var b = new Boom(400)
  b.appError = {
    code: 400,
    error: 103,
    message: 'Incorrect password',
    info: 'http://errors.lcip.org/todo/103'
  }
  return b
}

Boom.unverifiedAccount = function () {
  var b = new Boom(400)
  b.appError = {
    code: 400,
    error: 104,
    message: 'Unverified account',
    info: 'http://errors.lcip.org/todo/104'
  }
  return b
}

Boom.notImplemented = function () {
  return new Boom(501, 'Not implemented')
}

Boom.invalidCode = function (forgotPasswordToken) {
  var b = new Boom(400)
  b.appError = {
    code: 400,
    error: 105,
    message: 'Invalid code',
    info: 'http://errors.lcip.org/todo/105',
    tries: forgotPasswordToken.tries,
    ttl: forgotPasswordToken.ttl()
  }
  return b
}

module.exports = Boom
