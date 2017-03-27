/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

/**
 * Mock out Nexmo for functional tests. `checkBalance` always
 * returns `balanceThreshold`, and `sendSms` always pretends
 * the message is sent successfully.
 */

function MockNexmo(log, balanceThreshold) {
  return {
    account: {
      /**
       * Always returns the `balanceThreshold`
       */
      checkBalance: function checkBalance (callback) {
        log.info({ op: 'sms.balance.mock' })

        callback(null, {
          value: balanceThreshold
        })
      }
    },
    message: {
      /**
       * Drop message on the ground, call callback with `0` (send-OK) status.
       */
      sendSms: function sendSms (senderId, phoneNumber, message, options, callback) {
        // this is the same as how the Nexmo version works.
        if (! callback) {
          callback = options
          options = {}
        }

        log.info({ op: 'sms.send.mock' })

        callback(null, {
          messages: [{ status: '0' }]
        })
      }
    }
  }
}

module.exports = MockNexmo
