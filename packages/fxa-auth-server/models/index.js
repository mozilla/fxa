/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var crypto = require('crypto')
var inherits = require('util').inherits

var bigint = require('bigint')
var kvstore = require('kvstore')
var P = require('p-promise')
var uuid = require('uuid')

var Bundle = require('../bundle')
var srp = require('../srp')

module.exports = function (config) {

  config.smtp.subject = 'PiCL email verification'
  config.smtp.sender = config.smtp.sender || config.smtp.user
  var Mailer = require('../mailer')
  var mailer = new Mailer(config.smtp)

	var dbs = require('./kv')(P, kvstore, config)
	var Token = require('./token')(inherits, Bundle)

  var KeyFetchToken = require('./key_fetch_token')(
  	inherits,
  	Token,
  	dbs.store
  )
  var AccountResetToken = require('./account_reset_token')(
  	inherits,
  	Token,
  	crypto,
  	dbs.store
  )
  var SessionToken = require('./session_token')(
  	inherits,
  	Token,
  	dbs.store
  )
  var tokens = {
		AccountResetToken: AccountResetToken,
		KeyFetchToken: KeyFetchToken,
		SessionToken: SessionToken
	}

	var RecoveryMethod = require('./recovery_method')(
		crypto,
		P,
		dbs.store,
		mailer
	)
	var Account = require('./account')(
		P,
		SessionToken,
		RecoveryMethod,
		dbs.store,
		config.domain
	)
	var SrpSession = require('./srp_session')(
		P,
		uuid,
		srp,
		bigint,
		dbs.cache,
		Account
	)
	var AuthBundle = require('./auth_bundle')(
		inherits,
		Bundle,
		Account,
		tokens
	)

	return {
		dbs: dbs,
		Account: Account,
		AuthBundle: AuthBundle,
		RecoveryMethod: RecoveryMethod,
		SrpSession: SrpSession,
		tokens: tokens
	}
}
