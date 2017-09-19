/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var config = require('../config')
var P = require('./promise')
var reminderConfig = config.get('verificationReminders')

var LOG_REMINDERS_ERROR_CREATE = 'verification-reminder.create'
var LOG_REMINDERS_ERROR_DELETE = 'verification-reminder.delete'

module.exports = function (log, db) {
  /**
   * shouldRemind
   *
   * Determines if we should create a reminder for this user to verify their account.
   *
   * @returns {boolean}
   */
  function shouldRemind() {
    // if disabled then do not remind
    if (reminderConfig.rate === 0) {
      return false
    }

    // random between 0 and 100, inclusive
    var rand = Math.floor(Math.random() * (100 + 1))
    return rand <= (reminderConfig.rate * 100)
  }

  return {
    /**
     * Create a new reminder
     * @param reminderData
     * @param {string} reminderData.uid - The uid to remind.
     */
    create: function createReminder(reminderData) {
      if (! shouldRemind()) {
        // resolves if not part of the verification roll out
        return P.resolve(false)
      }

      reminderData.type = 'first'
      var firstReminder = db.createVerificationReminder(reminderData)
      reminderData.type = 'second'
      var secondReminder = db.createVerificationReminder(reminderData)

      return P.all([firstReminder, secondReminder])
        .catch(
          function (err) {
            log.error({ op: LOG_REMINDERS_ERROR_CREATE, err: err })
          }
        )
    },
    /**
     * Delete the reminder. Used if the user verifies their account.
     *
     * @param reminderData
     * @param {string} reminderData.uid - The uid for the reminder.
     */
    'delete': function deleteReminder(reminderData) {
      reminderData.type = 'first'
      var firstReminder = db.deleteVerificationReminder(reminderData)
      reminderData.type = 'second'
      var secondReminder = db.deleteVerificationReminder(reminderData)

      return P.all([firstReminder, secondReminder])
        .catch(
          function (err) {
            log.error({ op: LOG_REMINDERS_ERROR_DELETE, err: err })
          }
        )
    }
  }
}
