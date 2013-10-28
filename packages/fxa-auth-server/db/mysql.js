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

	function MySql() {
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

	MySql.prototype.ping = function () {
		return P(true)
	}

	// CREATE

	MySql.prototype.createAccount = function (data) {
		log.trace(
			{
				op: 'MySql.createAccount',
				uid: data && data.uid,
				email: data && data.email
			}
		)
		var sql = 'INSERT INTO accounts (uid, email, emailCode, verified, srp, kA, wrapKb, passwordStretching) VALUES ()'
	}

	MySql.prototype.createSessionToken = function (authToken) {
		log.trace({ op: 'MySql.createSessionToken', uid: authToken && authToken.uid })
		var sql = 'INSERT INTO sessionTokens (id, uid, data) VALUES ()'
	}

	MySql.prototype.createKeyFetchToken = function (authToken) {
		log.trace({ op: 'MySql.createKeyFetchToken', uid: authToken && authToken.uid })
		var sql = 'INSERT INTO keyFetchTokens (id, uid, data) VALUES ()'
	}

	MySql.prototype.createAccountResetToken = function (token /* authToken|forgotPasswordToken */) {
		log.trace({ op: 'MySql.createAccountResetToken', uid: token && token.uid })
		var sql = 'REPLACE INTO accountResetTokens (id, uid, data) VALUES ()'
	}

	MySql.prototype.createAuthToken = function (srpToken) {
		log.trace({ op: 'MySql.createAuthToken', uid: srpToken && srpToken.uid })
		var sql = 'INSERT INTO authTokens (id, uid, data) VALUES ()'
	}

	MySql.prototype.createSrpToken = function (emailRecord) {
		log.trace({ op: 'MySql.createSrpToken', uid: emailRecord && emailRecord.uid })
		var sql = 'INSERT INTO srpTokens (id, uid, bits, s, v, b, BB) VALUES ()'
	}

	MySql.prototype.createForgotPasswordToken = function (emailRecord) {
		log.trace({ op: 'MySql.createForgotPasswordToken', uid: emailRecord && emailRecord.uid })
		var sql = 'REPLACE INTO forgotPasswordTokens (id, uid, data, email, passcode, created, tries) VALUES ()'
	}

	// READ

	MySql.prototype.accountExists = function (email) {
		log.trace({ op: 'MySql.accountExists', email: email })
		var sql = 'SELECT uid FROM accounts WHERE email = ?'
	}

	MySql.prototype.accountDevices = function (uid) {
		log.trace({ op: 'MySql.accountDevices', uid: uid })
		var sql = 'SELECT id FROM sessionTokens WHERE uid = ?'
	}

	MySql.prototype.sessionToken = function (id) {
		log.trace({ op: 'MySql.sessionToken', id: id })
		var sql = 'SELECT uid, data, email, emailCode, verified FROM sessionTokens JOIN accounts ON sessionTokens.uid = accounts.uid WHERE sessionTokens.id = ?'
	}

	MySql.prototype.keyFetchToken = function (id) {
		log.trace({ op: 'MySql.keyFetchToken', id: id })
		var sql = 'SELECT uid, data, kA, wrapKb, verified FROM'
	}

	MySql.prototype.accountResetToken = function (id) {
		log.trace({ op: 'MySql.accountResetToken', id: id })
		var sql = 'SELECT uid, data FROM accountResetTokens WHERE id = ?'
	}

	MySql.prototype.authToken = function (id) {
		log.trace({ op: 'MySql.authToken', id: id })
		var sql = 'SELECT uid, data FROM authTokens WHERE id = ?'
	}

	MySql.prototype.srpToken = function (id) {
		log.trace({ op: 'MySql.srpToken', id: id })
		var sql = 'SELECT uid, bits, s, v, b, BB FROM srpTokens WHERE id = ?'
	}

	MySql.prototype.forgotPasswordToken = function (id) {
		log.trace({ op: 'MySql.forgotPasswordToken', id: id })
		var sql = 'SELECT uid, data, email, passcode, created, tries FROM forgotPasswordTokens WHERE id = ?'
	}

	MySql.prototype.emailRecord = function (email) {
		log.trace({ op: 'MySql.emailRecord', email: email })
		var sql = 'SELECT uid, srp, passwordStretching FROM accounts WHERE email = ?'
	}

	MySql.prototype.account = function (uid) {
		log.trace({ op: 'MySql.account', uid: uid })
		var sql = 'SELECT email, emailCode, verified, srp, kA, wrapKb, passwordStretching, accountResetTokenId, forgotPasswordTokenId FROM accounts WHERE uid = ?'
	}

	// UPDATE

	MySql.prototype.updateForgotPasswordToken = function (forgotPasswordToken) {
		log.trace({ op: 'MySql.udateForgotPasswordToken', uid: forgotPasswordToken && forgotPasswordToken.uid })
		var sql = 'UPDATE forgotPasswordTokens SET (tries) VALUES (?) WHERE id = ?'
	}

	// DELETE

	MySql.prototype.deleteAccount = function (authToken) {
		log.trace({ op: 'MySql.deleteAccount', uid: authToken && authToken.uid })
		var sql = 'BEGIN\n' +
			'DELETE FROM sessionTokens WHERE uid = ?\n' +
			// ...
			'DELETE FROM accounts WHERE uid = ?\n' +
			'COMMIT'
	}

	MySql.prototype.deleteSessionToken = function (sessionToken) {
		log.trace(
			{
				op: 'MySql.deleteSessionToken',
				id: sessionToken && sessionToken.id,
				uid: sessionToken && sessionToken.uid
			}
		)
		var sql = 'DELETE FROM sessionTokens WHERE id = ?'
	}

	MySql.prototype.deleteKeyFetchToken = function (keyFetchToken) {
		log.trace(
			{
				op: 'MySql.deleteKeyFetchToken',
				id: keyFetchToken && keyFetchToken.id,
				uid: keyFetchToken && keyFetchToken.uid
			}
		)
		var sql = 'DELETE FROM keyFetchTokens WHERE id = ?'
	}

	MySql.prototype.deleteAccountResetToken = function (accountResetToken) {
		log.trace(
			{
				op: 'MySql.deleteAccountResetToken',
				id: accountResetToken && accountResetToken.id,
				uid: accountResetToken && accountResetToken.uid
			}
		)
		var sql = 'DELETE FROM accountResetTokens WHERE id = ?'
	}

	MySql.prototype.deleteAuthToken = function (authToken) {
		log.trace(
			{
				op: 'MySql.deleteAuthToken',
				id: authToken && authToken.id,
				uid: authToken && authToken.uid
			}
		)
		var sql = 'DELETE FROM authTokens WHERE id = ?'
	}

	MySql.prototype.deleteSrpToken = function (srpToken) {
		log.trace(
			{
				op: 'MySql.deleteSrpToken',
				id: srpToken && srpToken.id,
				uid: srpToken && srpToken.uid
			}
		)
		var sql = 'DELETE FROM srpTokens WHERE id = ?'
	}

	MySql.prototype.deleteForgotPasswordToken = function (forgotPasswordToken) {
		log.trace(
			{
				op: 'MySql.deleteForgotPasswordToken',
				id: forgotPasswordToken && forgotPasswordToken.id,
				uid: forgotPasswordToken && forgotPasswordToken.uid
			}
		)
		var sql = 'DELETE FROM forgotPasswordTokens WHERE id = ?'
	}

	// BATCH

	MySql.prototype.resetAccount = function (accountResetToken, data) {
		log.trace({ op: 'MySql.resetAccount', uid: accountResetToken && accountResetToken.uid })
		var sql = 'BEGIN\n' +
			'UPDATE accounts SET (srp, wrapKb, passwordStretching) VALUES () WHERE uid = ?\n' +
			'DELETE FROM sessionTokens WHERE uid = ?\n' +
			// ...
			'COMMIT'
	}

	MySql.prototype.authFinish = function (srpToken) {
		log.trace({ op: 'MySql.authFinish', uid: srpToken && srpToken.uid })
		var sql = 'BEGIN\n' +
			'DELETE FROM srpTokens WHERE id = ?\n' +
			'INSERT INTO authTokens (id, uid, data) VALUES ()\n' +
			'COMMIT'
	}

	MySql.prototype.createSession = function (authToken) {
		log.trace({ op: 'MySql.createSession', uid: authToken && authToken.uid })
		var sql = 'BEGIN\n' +
			'DELETE FROM authTokens WHERE id = ?\n' +
			'INSERT INTO keyFetchTokens (id, uid, data) VALUES ()\n' +
			'INSERT INTO sessionTokens (id, uid, data) VALUES ()\n' +
			'COMMIT'
	}

	MySql.prototype.verifyEmail = function (account) {
		log.trace({ op: 'MySql.verifyEmail', uid: account && account.uid })
		var sql = 'UPDATE account SET (verified) VALUES (true) WHERE uid = ?'
	}

	MySql.prototype.createPasswordChange = function (authToken) {
		log.trace({ op: 'MySql.createPasswordChange', uid: authToken && authToken.uid })
		var sql = 'BEGIN\n' +
			'DELETE FROM authTokens WHERE id = ?\n' +
			'INSERT INTO keyFetchTokens (id, uid, data) VALUES ()\n' +
			'REPLACE INTO accountResetTokens (id, uid, data) VALUES ()\n' +
			'COMMIT'
	}

	MySql.prototype.forgotPasswordVerified = function (forgotPasswordToken) {
		log.trace({ op: 'MySql.forgotPasswordVerified', uid: forgotPasswordToken && forgotPasswordToken.uid })
		var sql = 'BEGIN\n' +
			'DELETE FROM forgotPasswordTokens WHERE id = ?\n' +
			'REPLACE INTO accountResetTokens (id, uid, data) VALUES ()\n' +
			'COMMIT'
	}

	return MySql
}
