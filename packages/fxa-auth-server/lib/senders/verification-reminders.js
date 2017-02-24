/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var logger = require('./log')('verification-reminders')
var P = require('../promise')
var config = require('../../mailer/config')
var reminderConfig = config.get('verificationReminders')

module.exports = function (mailer, db, options) {
  options = options || {}
  var log = options.log || logger

  return {
    /**
     * Process a fetch reminder, sends the email if account is not verified.
     *
     * @param reminderData
     * @param {buffer} reminderData.uid - The uid to remind.
     * @param {string} reminderData.type - The type of a reminder.
     * @returns {Promise}
     * @private
     */
    _processReminder: function (reminderData) {
      log.debug('_processReminder', reminderData)

      return db.account(reminderData.uid)
        .then(function (account) {
          if (! account.emailVerified) {
            // if account is not verified then send the reminder
            mailer.verificationReminderEmail({
              email: account.email,
              uid: account.uid.toString('hex'),
              code: account.emailCode.toString('hex'),
              type: reminderData.type,
              acceptLanguage: account.locale
            })
          } else {
            log.debug('_processReminder', { msg: 'Already Verified' })
          }
        }, function (err) {
          log.error('_processReminder', { err: err })
        })
    },
    _continuousPoll: function () {
      var self = this
      // fetch reminders for both types, separately
      var firstReminder = db.fetchReminders({
        reminderTime: reminderConfig.reminderTimeFirst,
        reminderTimeOutdated: reminderConfig.reminderTimeFirstOutdated,
        type: 'first',
        limit: reminderConfig.pollFetch
      })

      var secondReminder = db.fetchReminders({
        reminderTime: reminderConfig.reminderTimeSecond,
        reminderTimeOutdated: reminderConfig.reminderTimeSecondOutdated,
        type: 'second',
        limit: reminderConfig.pollFetch
      })

      return P.all([firstReminder, secondReminder])
        .then(
          function (reminderResultsByType) {
            reminderResultsByType.forEach(function (reminders) {
              reminders.forEach(function (reminder) {
                self._processReminder(reminder)
              })
            })
          }
        ).catch(function (err) {
          log.error('_continuousPoll', { err: err })
        })
    },
    poll: function poll () {
      /* istanbul ignore next */
      var self = this

      /* istanbul ignore next */
      if (reminderConfig.pollTime === 0) {
        log.info('poll', { message: 'polling is disabled' })
        return
      }

      /* istanbul ignore next */
      setTimeout(function () {
        self.poll()
      }, reminderConfig.pollTime)

      /* istanbul ignore next */
      self._continuousPoll()
    }
  }
}
