var inherits = require('util').inherits
var P = require('p-promise')
var Bundle = require('../bundle')

module.exports = function (log) {

	var Token = require('../models/token')(log, inherits, Bundle)
	var SessionToken = require('../models/session_token')(log, inherits, Token)
	var KeyFetchToken = require('../models/key_fetch_token')(log, inherits, Token)
	var AccountResetToken = require('../models/account_reset_token')(log, inherits, Token)
	var SrpToken = require('../models.srp_session')(log) // TODO
	var ForgotPasswordToken = require('../models/forgot_password_token')(log, inherits, Token)

	function Heap() {
		this.sessionTokens = {}
		this.keyFetchTokens = {}
		this.accountResetTokens = {}
		this.authTokens = {}
		this.srpTokens = {}
		this.forgotPasswordTokens = {}
		this.accounts = {}
		this.emailRecords = {}
	}

	function saveTo(collection) {
		return function (object) {
			collection[object.id] = object
			return object
		}
	}

	// The lazy way
	function deleteUid(uid, collection) {
		var keys = Object.keys(collection)
		for (var i = 0; i < keys.length; i++) {
			if (collection[keys[i]].uid === uid) {
				delete collection[keys[i]]
			}
		}
	}

	Heap.prototype.ping = function () {
		return P(true)
	}

	// CREATE

	Heap.prototype.createAccount = function (data) {
		this.accounts[data.uid] = data
		this.emailRecords[data.email] = data.uid
		return P(data)
	}

	Heap.prototype.createSessionToken = function (authToken) {
		return SessionToken.create(authToken)
			.then(saveTo(this.sessionTokens))
			.then(
				function (sessionToken) {
					var account = this.account[sessionToken.uid]
					account.devices[sessionToken.id] = sessionToken
					return sessionToken
				}.bind(this)
			)
	}

	Heap.prototype.createKeyFetchToken = function (authToken) {
		return KeyFetchToken.create(authToken)
			.then(saveTo(this.keyFetchTokens))
	}

	Heap.prototype.createAccountResetToken = function (token /* authToken|forgotPasswordToken */) {
		return AccountResetToken.create(token)
			.then(
				function (accountResetToken) {
					var account = this.accounts[accountResetToken.uid]
					if (!account) { return P.reject('Account not found') }
					account.accountResetToken = accountResetToken.id
					return accountResetToken
				}.bind(this)
			)
			.then(saveTo(this.accountResetTokens))
	}

	Heap.prototype.createAuthToken = function (srpToken) {
		return AuthToken.create(srpToken)
			.then(saveTo(this.authTokens))
	}

	Heap.prototype.createSrpToken = function (emailRecord) {
		return SrpToken.create(emailRecord)
			.then(saveTo(this.srpTokens))
	}

	Heap.prototype.createForgotPasswordToken = function (emailRecord) {
		return ForgotPasswordToken.create(emailRecord)
			.then(
				function (forgotPasswordToken) {
					var account = this.accounts[forgotPasswordToken.uid]
					if (!account) { return P.reject('Account not found') }
					account.forgotPasswordToken = forgotPasswordToken.id
					return forgotPasswordToken
				}.bind(this)
			)
			.then(saveTo(this.forgotPasswordTokens))
	}

	// READ

	Heap.prototype.accountExists = function (email) {
		return P(!!this.emailRecords[email])
	}

	Heap.prototype.accountDevices = function (uid) {
		return this.account(uid)
			.then(
				function (account) {
					return account.devices
				}
			)
	}

	Heap.prototype.sessionToken = function (id) {
		var sessionToken = this.sessionTokens[id]
		if (!sessionToken) { return P.reject('SessionToken not found') }
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject('Account not found') }
		sessionToken.email = account.email
		sessionToken.emailCode = account.emailCode
		sessionToken.verified = account.verified
		return P(sessionToken)
	}

	Heap.prototype.keyFetchToken = function (id) {
		var keyFetchToken = this.keyFetchTokens[id]
		if (!keyFetchToken) { return P.reject('KeyFetchToken not found') }
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject('Account not found') }
		keyFetchToken.kA = account.kA
		keyFetchToken.wrapKb = account.wrapKb
		keyFetchToken.verified = account.verified
		return P(keyFetchToken)
	}

	Heap.prototype.accountResetToken = function (id) {
		var accountResetToken = this.accountResetTokens[id]
		if (!accountResetToken) { return P.reject('AccountResetToken not found') }
		return P(accountResetToken)
	}

	Heap.prototype.authToken = function (id) {
		var authToken = this.authTokens[id]
		if (!authToken) { return P.reject('AuthToken not found') }
		return P(authToken)
	}

	Heap.prototype.srpToken = function (id) {
		var srpToken = this.srpTokens[id]
		if (!srpToken) { return P.reject('SrpToken not found') }
		return P(srpToken)
	}

	Heap.prototype.forgotPasswordToken = function (id) {
		var forgotPasswordToken = this.forgotPasswordTokens[id]
		if (!forgotPasswordToken) { return P.reject('ForgotPasswordToken not found') }
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject('Account not found') }
		forgotPasswordToken.email = account.email
		return P(forgotPasswordToken)
	}

	Heap.prototype.emailRecord = function (email) {
		var uid = this.emailRecords[email]
		return this.account(uid)
	}

	Heap.prototype.account = function (uid) {
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject('Account not found') }
		return P(account)
	}

	// UPDATE

	Heap.prototype.udateForgotPasswordToken = function (forgotPasswordToken) {
		return P(true)
	}

	// DELETE

	Heap.prototype.deleteAccount = function (authToken) {
		var account = this.accounts[authToken.uid]
		if (!account) { return P.reject('Account not found') }
		deleteUid(account.uid, this.sessionTokens)
		deleteUid(account.uid, this.keyFetchTokens)
		deleteUid(account.uid, this.authTokens)
		deleteUid(account.uid, this.srpTokens)
		deleteUid(account.uid, this.accountResetTokens)
		deleteUid(account.uid, this.forgotPasswordTokens)
		delete this.emailRecords[account.email]
		delete this.accounts[account.uid]
		return P(true)
	}

	Heap.prototype.deleteSessionToken = function (sessionToken) {
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject('Account not found') }
		delete account.devices[sessionToken.id]
		delete this.sessionTokens[sessionToken.id]
		return P(true)
	}

	Heap.prototype.deleteKeyFetchToken = function (keyFetchToken) {
		delete this.keyFetchTokens[keyFetchToken.id]
		return P(true)
	}

	Heap.prototype.deleteAccountResetToken = function (accountResetToken) {
		delete this.accountResetTokens[accountResetToken.id]
		return P(true)
	}

	Heap.prototype.deleteAuthToken = function (authToken) {
		delete this.authTokens[authToken.id]
		return P(true)
	}

	Heap.prototype.deleteSrpToken = function (srpToken) {
		delete this.srpTokens[srpToken.id]
		return P(true)
	}

	Heap.prototype.deleteForgotPasswordToken = function (forgotPasswordToken) {
		delete this.forgotPasswordTokens[forgotPasswordToken.id]
		return P(true)
	}

	// BATCH

	Heap.prototype.resetAccount = function (accountResetToken, data) {
		var account = this.accounts[accountResetToken.uid]
		if (!account) { return P.reject('Account not found') }
		account.srp = data.srp
		account.wrapKb = data.wrapKb
		account.passwordStretching = data.passwordStretching
		account.devices = {}
		account.accountResetToken = null
		account.forgotPasswordToken = null
		deleteUid(account.uid, this.sessionTokens)
		deleteUid(account.uid, this.keyFetchTokens)
		deleteUid(account.uid, this.authTokens)
		deleteUid(account.uid, this.srpTokens)
		deleteUid(account.uid, this.accountResetTokens)
		deleteUid(account.uid, this.forgotPasswordTokens)
		return P(true)
	}

	Heap.prototype.authFinish = function (srpToken) {
		return this.deleteSrpToken(srpToken)
			.then(this.createAuthToken.bind(this, srpToken))
	}

	Heap.prototype.createSession = function (authToken) {
		return this.deleteAuthToken(authToken)
			.then(
				function () {
					return P.all([
							this.createKeyFetchToken(authToken),
							this.createSessionToken(authToken)
						])
				}
			)
			.then(
				function (tokens) {
					return {
						keyFetchToken: tokens[0],
						sessionToken: tokens[1]
					}
				}
			)
	}

	Heap.prototype.verifyEmail = function (account) {
		account.verified = true
		return P(true)
	}

	Heap.prototype.createPasswordChange = function (authToken) {
		return this.deleteAuthToken(authToken)
			.then(
				function () {
					return P.all([
							this.createKeyFetchToken(authToken),
							this.createAccountResetToken(authToken)
						])
				}
			)
			.then(
				function (tokens) {
					return {
						keyFetchToken: tokens[0],
						accountResetToken: tokens[1]
					}
				}
			)
	}

	Heap.prototype.forgotPasswordVerified = function (forgotPasswordToken) {
		return this.deleteForgotPasswordToken(forgotPasswordToken)
			.then(this.createAccountResetToken.bind(this, forgotPasswordToken))
	}

	return Heap
}
