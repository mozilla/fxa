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

const args = parseArgs()
const log = require('../../lib/log')(config.log.level, 'send-sms')

require('../../lib/senders')(config, log)
  .then(senders => {
    return senders.sms.send.apply(null, args)
  })
  .then(() => {
    console.log('SENT!')
  })
  .catch(error => {
    let message = error.message
    if (error.reason && error.reasonCode) {
      message = `${message}: ${error.reasonCode} ${error.reason}`
    } else if (error.stack) {
      message = error.stack
    }
    fail(message)
  })

function fail (message) {
  console.error(message)
  process.exit(1)
}

function parseArgs () {
  let acceptLanguage, messageId, senderId, phoneNumber

  switch (process.argv.length) {
    /* eslint-disable indent, no-fallthrough */
    case 6:
      acceptLanguage = process.argv[5]
    case 5:
      messageId = process.argv[4]
    case 4:
      senderId = process.argv[3]
    case 3:
      phoneNumber = process.argv[2]
      break
    default:
      fail(`Usage: ${process.argv[1]} phoneNumber [senderId] [messageId] [acceptLanguage]`)
    /* eslint-enable indent, no-fallthrough */
  }

  return [
    phoneNumber,
    senderId || 'Firefox',
    messageId || 1,
    acceptLanguage || 'en'
  ]
}

