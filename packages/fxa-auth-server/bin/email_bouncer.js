/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config').root()
var log = require('../lib/log')(config.log.level, 'fxa-email-bouncer')
var error = require('../lib/error')
var Token = require('../lib/tokens')(log, config.tokenLifetimes)
var bounces = require('../lib/bounces')(log)

var DB = require('../lib/db')(
  config.db.backend,
  log,
  error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

DB.connect(config[config.db.backend])
  .done(
    function (db) {
      bounces(config.bounces, db)
    }
  )
