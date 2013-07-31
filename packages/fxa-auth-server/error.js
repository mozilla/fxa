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

module.exports = Boom
