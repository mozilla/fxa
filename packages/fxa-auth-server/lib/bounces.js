/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var eaddrs = require('email-addresses')
var P = require('./promise')

module.exports = function (log, error) {

  return function start(bounceQueue, db) {

    function accountDeleted(uid, email) {
      log.info({ op: 'accountDeleted', uid: uid.toString('hex'), email: email })
    }

    function gotError(email, err) {
      log.error({ op: 'databaseError', email: email, err: err })
    }

    function findEmailRecord(email) {
      return db.emailRecord(email)
        .catch(function (err) {
          // The mail agent may have mangled the email address
          // that's being reported in the bounce notification.
          // Try looking up by normalized form as well.
          if (err.errno !== error.ERRNO.ACCOUNT_UNKNOWN) {
            throw err
          }
          var normalizedEmail = eaddrs.parseOneAddress(email).address
          if (normalizedEmail === email) {
            throw err
          }
          return db.emailRecord(normalizedEmail)
        })
    }

    function deleteAccountIfUnverified(record) {
      if (!record.emailVerified) {
        return db.deleteAccount(record)
          .then(
            accountDeleted.bind(null, record.uid, record.email),
            gotError.bind(null, record.email)
          )
      } else {
        // A previously-verified email is now bouncing.
        // We don't know what to do here, yet.
        // But we can measure it!
        log.increment('account.email_bounced.already_verified')
      }
    }

    function handleBounce(message) {
      var recipients = []
      if (message.bounce && message.bounce.bounceType === 'Permanent') {
        recipients = message.bounce.bouncedRecipients
      }
      else if (message.complaint && message.complaint.complaintFeedbackType === 'abuse') {
        recipients = message.complaint.complainedRecipients
      }
      return P.each(recipients, function (recipient) {
        var email = recipient.emailAddress
        log.info({ op: 'handleBounce', email: email, bounce: !!message.bounce })
        log.increment('account.email_bounced')
        return findEmailRecord(email)
          .then(
            deleteAccountIfUnverified,
            gotError.bind(null, email)
          )
      }).then(
        function () {
          // We always delete the message, even if handling some addrs failed.
          message.del()
        }
      )
    }

    bounceQueue.on('data', handleBounce)
    bounceQueue.start()

    return {
      bounceQueue: bounceQueue,
      handleBounce: handleBounce
    }
  }
}
