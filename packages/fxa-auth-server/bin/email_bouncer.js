/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config').getProperties()
var log = require('../lib/log')(config.log.level, 'fxa-email-bouncer')
var error = require('../lib/error')
var Token = require('../lib/tokens')(log, config.tokenLifetimes)
var SQSReceiver = require('../lib/sqs')(log)
var bounces = require('../lib/bounces')(log, error)

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

var bounceQueue = new SQSReceiver(config.bounces.region, [
  config.bounces.bounceQueueUrl,
  config.bounces.complaintQueueUrl
])

DB.connect(config[config.db.backend])
  .done(
    function (db) {
      bounces(bounceQueue, db)
    }
  )
