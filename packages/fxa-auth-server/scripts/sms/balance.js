#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const config = require('../../config').getProperties()
const NOT_SET = 'YOU MUST CHANGE ME'

if (config.sms.apiKey === NOT_SET || config.sms.apiSecret === NOT_SET) {
  fail('Come back and try again when you\'ve set SMS_API_KEY and SMS_API_SECRET.')
}

const log = require('../../lib/log')(config.log.level, 'sms-balance')

require('../../lib/senders')(config, log)
  .then(senders => {
    return senders.sms.balance()
  })
  .then(result => {
    console.log(result)
  })
  .catch(error => {
    fail(error.stack || error.message)
  })

function fail (message) {
  console.error(message)
  process.exit(1)
}

