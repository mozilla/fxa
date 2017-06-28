/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var eaddrs = require('email-addresses')
var P = require('./../promise')
var utils = require('./utils/helpers')

module.exports = function (log, error) {

  return function start(bounceQueue, db) {

    function accountDeleted(uid, email) {
      log.info({ op: 'accountDeleted', uid: uid, email: email })
    }

    function gotError(email, err) {
      log.error({ op: 'databaseError', email: email, err: err })
    }

    function findEmailRecord(email) {
      return db.emailRecord(email)
    }

    function recordBounce(bounce) {
      return db.createEmailBounce(bounce)
    }

    function deleteAccountIfUnverified(record) {
      if (! record.emailVerified) {
        return db.deleteAccount(record)
          .then(
            accountDeleted.bind(null, record.uid, record.email),
            gotError.bind(null, record.email)
          )
      }
    }

    function handleBounce(message) {
      var recipients = []
      // According to the AWS SES docs, a notification will never
      // include multiple types, so it's fine for us to check for
      // EITHER bounce OR complaint here.
      if (message.bounce) {
        recipients = message.bounce.bouncedRecipients
      } else if (message.complaint) {
        recipients = message.complaint.complainedRecipients
      }

      // SES can now send custom headers if enabled on topic.
      // Headers are stored as an array of name/value pairs.
      // Log the `X-Template-Name` header to help track the email template that bounced.
      // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
      const templateName = utils.getHeaderValue('X-Template-Name', message)
      const language = utils.getHeaderValue('Content-Language', message)

      return P.each(recipients, function (recipient) {
        const email = eaddrs.parseOneAddress(recipient.emailAddress).address
        const emailDomain = utils.getAnonymizedEmailDomain(email)
        const logData = {
          op: 'handleBounce',
          action: recipient.action,
          email: email,
          domain: emailDomain,
          bounce: !! message.bounce,
          diagnosticCode: recipient.diagnosticCode,
          status: recipient.status
        }
        const bounce = {
          email: email
        }

        // Template name corresponds directly with the email template that was used
        if (templateName) {
          logData.template = templateName
        }

        if (language) {
          logData.lang = language
        }

        // Log the type of bounce that occurred
        // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html#bounce-types
        if (message.bounce && message.bounce.bounceType) {
          bounce.bounceType = logData.bounceType = message.bounce.bounceType

          if (message.bounce.bounceSubType) {
            bounce.bounceSubType = logData.bounceSubType = message.bounce.bounceSubType
          }
        } else if (message.complaint) {
          // Log the type of complaint and userAgent reported
          logData.complaint = !! message.complaint
          bounce.bounceType = 'Complaint'


          if (message.complaint.userAgent) {
            logData.complaintUserAgent = message.complaint.userAgent
          }

          if (message.complaint.complaintFeedbackType) {
            bounce.bounceSubType = logData.complaintFeedbackType = message.complaint.complaintFeedbackType
          }
        }

        // Log the bounced flowEvent and emailEvent metrics
        utils.logFlowEventFromMessage(log, message, 'bounced')
        utils.logEmailEventFromMessage(log, message, 'bounced', emailDomain)
        log.info(logData)

        const shouldDelete = bounce.bounceType === 'Permanent' ||
          (bounce.bounceType === 'Complaint' && bounce.bounceSubType === 'abuse')

        const work = [
          recordBounce(bounce)
            .catch(gotError.bind(null, email))
        ]

        if (shouldDelete) {
          work.push(findEmailRecord(email)
            .then(
              deleteAccountIfUnverified,
              gotError.bind(null, email)
            ))
        }
        return P.all(work)
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
