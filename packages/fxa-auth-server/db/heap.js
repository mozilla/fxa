var P = require('p-promise')

module.exports = function (
	log,
	error,
	AuthToken,
	SessionToken,
	KeyFetchToken,
	AccountResetToken,
	SrpToken,
	ForgotPasswordToken
	) {

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
		log.trace(
			{
				op: 'Heap.createAccount',
				uid: data && data.uid,
				email: data && data.email
			}
		)
		this.accounts[data.uid] = data
		this.emailRecords[data.email] = data.uid
		return P(data)
	}

	Heap.prototype.createSessionToken = function (authToken) {
		log.trace({ op: 'Heap.createSessionToken', uid: authToken && authToken.uid })
		return SessionToken.create(authToken.uid)
			.then(saveTo(this.sessionTokens))
			.then(
				function (sessionToken) {
					var account = this.accounts[sessionToken.uid]
					account.devices[sessionToken.id] = sessionToken
					return sessionToken
				}.bind(this)
			)
	}

	Heap.prototype.createKeyFetchToken = function (authToken) {
		log.trace({ op: 'Heap.createKeyFetchToken', uid: authToken && authToken.uid })
		return KeyFetchToken.create(authToken.uid)
			.then(saveTo(this.keyFetchTokens))
	}

	Heap.prototype.createAccountResetToken = function (token /* authToken|forgotPasswordToken */) {
		log.trace({ op: 'Heap.createAccountResetToken', uid: token && token.uid })
		return AccountResetToken.create(token.uid)
			.then(
				function (accountResetToken) {
					var account = this.accounts[accountResetToken.uid]
					if (!account) { return P.reject(error.unknownAccount()) }
					account.accountResetToken = accountResetToken.id
					return accountResetToken
				}.bind(this)
			)
			.then(saveTo(this.accountResetTokens))
	}

	Heap.prototype.createAuthToken = function (srpToken) {
		log.trace({ op: 'Heap.createAuthToken', uid: srpToken && srpToken.uid })
		return AuthToken.create(srpToken.uid)
			.then(saveTo(this.authTokens))
	}

	Heap.prototype.createSrpToken = function (emailRecord) {
		log.trace({ op: 'Heap.createSrpToken', uid: emailRecord && emailRecord.uid })
		return SrpToken.create(emailRecord)
			.then(saveTo(this.srpTokens))
	}

	Heap.prototype.createForgotPasswordToken = function (emailRecord) {
		log.trace({ op: 'Heap.createForgotPasswordToken', uid: emailRecord && emailRecord.uid })
		return ForgotPasswordToken.create(emailRecord.uid)
			.then(
				function (forgotPasswordToken) {
					var account = this.accounts[forgotPasswordToken.uid]
					if (!account) { return P.reject(error.unknownAccount()) }
					account.forgotPasswordToken = forgotPasswordToken.id
					return forgotPasswordToken
				}.bind(this)
			)
			.then(saveTo(this.forgotPasswordTokens))
	}

	// READ

	Heap.prototype.accountExists = function (email) {
		log.trace({ op: 'Heap.accountExists', email: email })
		return P(!!this.emailRecords[email])
	}

	Heap.prototype.accountDevices = function (uid) {
		log.trace({ op: 'Heap.accountDevices', uid: uid })
		return this.account(uid)
			.then(
				function (account) {
					return account.devices
				}
			)
	}

	Heap.prototype.sessionToken = function (id) {
		log.trace({ op: 'Heap.sessionToken', id: id })
		var sessionToken = this.sessionTokens[id]
		if (!sessionToken) { return P.reject(error.invalidToken()) }
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject(error.unknownAccount()) }
		sessionToken.email = account.email
		sessionToken.emailCode = account.emailCode
		sessionToken.verified = account.verified
		return P(sessionToken)
	}

	Heap.prototype.keyFetchToken = function (id) {
		log.trace({ op: 'Heap.keyFetchToken', id: id })
		var keyFetchToken = this.keyFetchTokens[id]
		if (!keyFetchToken) { return P.reject(error.invalidToken()) }
		var account = this.accounts[keyFetchToken.uid]
		if (!account) { return P.reject(error.unknownAccount()) }
		keyFetchToken.kA = account.kA
		keyFetchToken.wrapKb = account.wrapKb
		keyFetchToken.verified = account.verified
		return P(keyFetchToken)
	}

	Heap.prototype.accountResetToken = function (id) {
		log.trace({ op: 'Heap.accountResetToken', id: id })
		var accountResetToken = this.accountResetTokens[id]
		if (!accountResetToken) { return P.reject(error.invalidToken()) }
		return P(accountResetToken)
	}

	Heap.prototype.authToken = function (id) {
		log.trace({ op: 'Heap.authToken', id: id })
		var authToken = this.authTokens[id]
		if (!authToken) { return P.reject(error.invalidToken()) }
		return P(authToken)
	}

	Heap.prototype.srpToken = function (id) {
		log.trace({ op: 'Heap.srpToken', id: id })
		var srpToken = this.srpTokens[id]
		if (!srpToken) { return P.reject(error.invalidToken()) }
		return P(srpToken)
	}

	Heap.prototype.forgotPasswordToken = function (id) {
		log.trace({ op: 'Heap.forgotPasswordToken', id: id })
		var forgotPasswordToken = this.forgotPasswordTokens[id]
		if (!forgotPasswordToken) { return P.reject(error.invalidToken()) }
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject(error.unknownAccount()) }
		forgotPasswordToken.email = account.email
		return P(forgotPasswordToken)
	}

	Heap.prototype.emailRecord = function (email) {
		log.trace({ op: 'Heap.emailRecord', email: email })
		var uid = this.emailRecords[email]
		if (!uid) { return P.reject(error.unknownAccount(email)) }
		return this.account(uid)
	}

	Heap.prototype.account = function (uid) {
		log.trace({ op: 'Heap.account', uid: uid })
		var account = this.accounts[uid]
		if (!account) { return P.reject(error.unknownAccount()) }
		return P(account)
	}

	// UPDATE

	Heap.prototype.udateForgotPasswordToken = function (forgotPasswordToken) {
		log.trace({ op: 'Heap.udateForgotPasswordToken', uid: forgotPasswordToken && forgotPasswordToken.uid })
		return P(true)
	}

	// DELETE

	Heap.prototype.deleteAccount = function (authToken) {
		log.trace({ op: 'Heap.deleteAccount', uid: authToken && authToken.uid })
		var account = this.accounts[authToken.uid]
		if (!account) { return P.reject(error.unknownAccount()) }
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
		log.trace(
			{
				op: 'Heap.deleteSessionToken',
				id: sessionToken && sessionToken.id,
				uid: sessionToken && sessionToken.uid
			}
		)
		var account = this.accounts[sessionToken.uid]
		if (!account) { return P.reject(error.unknownAccount()) }
		delete account.devices[sessionToken.id]
		delete this.sessionTokens[sessionToken.id]
		return P(true)
	}

	Heap.prototype.deleteKeyFetchToken = function (keyFetchToken) {
		log.trace(
			{
				op: 'Heap.deleteKeyFetchToken',
				id: keyFetchToken && keyFetchToken.id,
				uid: keyFetchToken && keyFetchToken.uid
			}
		)
		delete this.keyFetchTokens[keyFetchToken.id]
		return P(true)
	}

	Heap.prototype.deleteAccountResetToken = function (accountResetToken) {
		log.trace(
			{
				op: 'Heap.deleteAccountResetToken',
				id: accountResetToken && accountResetToken.id,
				uid: accountResetToken && accountResetToken.uid
			}
		)
		delete this.accountResetTokens[accountResetToken.id]
		return P(true)
	}

	Heap.prototype.deleteAuthToken = function (authToken) {
		log.trace(
			{
				op: 'Heap.deleteAuthToken',
				id: authToken && authToken.id,
				uid: authToken && authToken.uid
			}
		)
		delete this.authTokens[authToken.id]
		return P(true)
	}

	Heap.prototype.deleteSrpToken = function (srpToken) {
		log.trace(
			{
				op: 'Heap.deleteSrpToken',
				id: srpToken && srpToken.id,
				uid: srpToken && srpToken.uid
			}
		)
		delete this.srpTokens[srpToken.id]
		return P(true)
	}

	Heap.prototype.deleteForgotPasswordToken = function (forgotPasswordToken) {
		log.trace(
			{
				op: 'Heap.deleteForgotPasswordToken',
				id: forgotPasswordToken && forgotPasswordToken.id,
				uid: forgotPasswordToken && forgotPasswordToken.uid
			}
		)
		delete this.forgotPasswordTokens[forgotPasswordToken.id]
		return P(true)
	}

	// BATCH

	Heap.prototype.resetAccount = function (accountResetToken, data) {
		log.trace({ op: 'Heap.resetAccount', uid: accountResetToken && accountResetToken.uid })
		var account = this.accounts[accountResetToken.uid]
		if (!account) { return P.reject(error.unknownAccount()) }
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
		log.trace({ op: 'Heap.authFinish', uid: srpToken && srpToken.uid })
		return this.deleteSrpToken(srpToken)
			.then(this.createAuthToken.bind(this, srpToken))
	}

	Heap.prototype.createSession = function (authToken) {
		log.trace({ op: 'Heap.createSession', uid: authToken && authToken.uid })
		return this.deleteAuthToken(authToken)
			.then(
				function () {
					return P.all([
							this.createKeyFetchToken(authToken),
							this.createSessionToken(authToken)
						])
				}.bind(this)
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
		log.trace({ op: 'Heap.verifyEmail', uid: account && account.uid })
		account.verified = true
		return P(true)
	}

	Heap.prototype.createPasswordChange = function (authToken) {
		log.trace({ op: 'Heap.createPasswordChange', uid: authToken && authToken.uid })
		return this.deleteAuthToken(authToken)
			.then(
				function () {
					return P.all([
							this.createKeyFetchToken(authToken),
							this.createAccountResetToken(authToken)
						])
				}.bind(this)
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
		log.trace({ op: 'Heap.forgotPasswordVerified', uid: forgotPasswordToken && forgotPasswordToken.uid })
		return this.deleteForgotPasswordToken(forgotPasswordToken)
			.then(this.createAccountResetToken.bind(this, forgotPasswordToken))
	}

	return Heap
}
