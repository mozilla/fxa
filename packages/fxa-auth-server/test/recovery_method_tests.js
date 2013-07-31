var test = require('tap').test
var crypto = require('crypto')
var P = require('p-promise')
var config = require('../config').root()

var dbs = require('../kv')(config)

const HEX_STRING = /^(?:[a-fA-F0-9]{2})+$/

var sends = 0
var mailer = {
  sendCode: function () { sends++; return P(null) }
}

var models = require('../models')(config, dbs, mailer)
var RecoveryMethod = models.RecoveryMethod

test(
	'RecoveryMethod.create generates a random 32 byte code as a hex string',
	function (t) {
		function end() { t.end() }
		RecoveryMethod.create('xxx', 'me@example.com', true)
			.then(
				function (x) {
					t.equal(x.code.length, 64)
					t.equal(HEX_STRING.test(x.code), true)
					return x
				}
			)
			.then(
				function (x) {
					return x.del()
				}
			)
			.done(end, end)
	}
)

test(
	'RecoveryMethod.create calls mailer.sendCode',
	function (t) {
		sends = 0
		function end() { t.end() }
		RecoveryMethod.create('xxx', 'me@example.com', true)
			.then(
				function (x) {
					t.equal(sends, 1)
					sends = 0
					return x.del()
				}
			)
			.done(end, end)
	}
)

test(
	'recoveryMethod.verify sets verified to true if the codes match',
	function (t) {
		function end() { t.end() }
		RecoveryMethod.create('xxx', 'me@example.com', true)
			.then(
				function (x) {
					t.equal(x.verified, false)
					var c = x.code
					return x.verify(c)
				}
			)
			.then(
				function (x) {
					t.equal(x.verified, true)
					return x.del()
				}
			)
			.done(end, end)
	}
)

test(
	'recoveryMethod.verify does not set verified if codes do not match',
	function (t) {
		function end() { t.end() }
		RecoveryMethod.create('xxx', 'me@example.com', true)
			.then(
				function (x) {
					t.equal(x.verified, false)
					var c = crypto.randomBytes(32).toString('hex')
					return x.verify(c)
				}
			)
			.then(
				function (x) {
					t.equal(x.verified, false)
					return x.del()
				}
			)
			.done(end, end)
	}
)

test(
	'recoveryMethod.verify will not unset the verified flag from true to false',
	function (t) {
		function end() { t.end() }
		RecoveryMethod.create('xxx', 'me@example.com', true)
			.then(
				function (x) {
					t.equal(x.verified, false)
					var c = x.code
					return x.verify(c)
				}
			)
			.then(
				function (x) {
					t.equal(x.verified, true)
					return x.verify('bad1')
				}
			)
			.then(
				function (x) {
					t.equal(x.verified, true)
					return x.del()
				}
			)
			.done(end, end)
	}
)
