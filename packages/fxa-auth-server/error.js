var Boom = require('hapi').error

Boom.accountExists = function (email) {
	return new Boom(400, 'Account already exists for ' + email)
}

Boom.unknownAccount = function () {
	return new Boom(400, 'Unknown account')
}

Boom.incorrectPassword = function () {
	return new Boom(400, 'Incorrect password')
}

Boom.unverifiedAccount = function () {
	return new Boom(400, 'Unverified account')
}

Boom.notImplemented = function () {
	return new Boom(501, 'Not implemented')
}

Boom.invalidCode = function (forgotPasswordToken) {
	var b = new Boom(400, 'Invalid code')
	b.tries = forgotPasswordToken.tries
	b.ttl = forgotPasswordToken.ttl()
	return b
}

module.exports = Boom
