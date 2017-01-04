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

    function getHeaderValue(headerName, message){
      var value = ''
      if (message.mail && message.mail.headers) {
        message.mail.headers.some(function (header) {
          if (header.name === headerName) {
            value = header.value
            return true
          }

          return false
        })
      }

      return value
    }


    function handleBounce(message) {
      const currentTime = Date.now()

      var recipients = []
      if (message.bounce && message.bounce.bounceType === 'Permanent') {
        recipients = message.bounce.bouncedRecipients
      }
      else if (message.complaint && message.complaint.complaintFeedbackType === 'abuse') {
        recipients = message.complaint.complainedRecipients
      }

      // SES can now send custom headers if enabled on topic.
      // Headers are stored as an array of name/value pairs.
      // Log the `X-Template-Name` header to help track the email template that bounced.
      // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
      var templateName = getHeaderValue('X-Template-Name', message)

      return P.each(recipients, function (recipient) {

        var email = recipient.emailAddress
        var logData = {
          op: 'handleBounce',
          action: recipient.action,
          email: email,
          bounce: !!message.bounce,
          diagnosticCode: recipient.diagnosticCode,
          status: recipient.status
        }

        // Template name corresponds directly with the email template that was used
        if(templateName) {
          logData.template = templateName
        }

        // Log the type of bounce that occurred
        // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-types
        if (message.bounce && message.bounce.bounceType) {
          logData.bounceType = message.bounce.bounceType

          if (message.bounce && message.bounce.bounceSubType) {
            logData.bounceSubType = message.bounce.bounceSubType
          }
        }

        // Log flow metrics if `flowId` and `flowBeginTime` specified in headers
        const flowId = getHeaderValue('X-Flow-Id', message)
        const flowBeginTime = getHeaderValue('X-Flow-Begin-Time', message)
        const elapsedTime = currentTime - flowBeginTime

        if (flowId && flowBeginTime && (elapsedTime > 0)) {
          const eventName = `email.${templateName}.bounced`

          // Flow events have a specific event and structure that must be emitted.
          // Ref `gather` in https://github.com/mozilla/fxa-auth-server/blob/master/lib/metrics/context.js
          const flowEventInfo = {
            event: eventName,
            time: currentTime,
            flow_id: flowId,
            flow_time: elapsedTime
          }

          log.info('flowEvent', flowEventInfo)
        }

        log.info(logData)
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
