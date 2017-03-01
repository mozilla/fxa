/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var config = require('../config').getProperties()
var log = require('../lib/log')(config.log.level, 'fxa-email-bouncer')
var error = require('../lib/error')
var Token = require('../lib/tokens')(log, config)
var SQSReceiver = require('../lib/sqs')(log)
var bounces = require('../lib/email/bounces')(log, error)
var delivery = require('../lib/email/delivery')(log)

var DB = require('../lib/db')(
  config,
  log,
  error,
  Token.SessionToken,
  Token.KeyFetchToken,
  Token.AccountResetToken,
  Token.PasswordForgotToken,
  Token.PasswordChangeToken
)

var bounceQueue = new SQSReceiver(config.emailNotifications.region, [
  config.emailNotifications.bounceQueueUrl,
  config.emailNotifications.complaintQueueUrl
])

var deliveryQueue = new SQSReceiver(config.emailNotifications.region, [
  config.emailNotifications.deliveryQueueUrl
])

DB.connect(config[config.db.backend])
  .then(
    function (db) {
      bounces(bounceQueue, db)
      delivery(deliveryQueue)
    }
  )
