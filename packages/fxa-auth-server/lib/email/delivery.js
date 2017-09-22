/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var P = require('./../promise')
var utils = require('./utils/helpers')

module.exports = function (log) {

  return function start(deliveryQueue) {

    function handleDelivery(message) {
      utils.logErrorIfHeadersAreWeirdOrMissing(log, message, 'delivery')

      var recipients = []
      if (message.delivery && message.notificationType === 'Delivery') {
        recipients = message.delivery.recipients
      }

      // SES can now send custom headers if enabled on topic.
      // Headers are stored as an array of name/value pairs.
      // Log the `X-Template-Name` header to help track the email template that delivered.
      // Ref: http://docs.aws.amazon.com/ses/latest/DeveloperGuide/notification-contents.html
      const templateName = utils.getHeaderValue('X-Template-Name', message)

      return P.each(recipients, function (recipient) {

        var email = recipient
        var emailDomain = utils.getAnonymizedEmailDomain(email)
        var logData = {
          op: 'handleDelivery',
          email: email,
          domain: emailDomain,
          processingTimeMillis: message.delivery.processingTimeMillis
        }

        // Template name corresponds directly with the email template that was used
        if (templateName) {
          logData.template = templateName
        }

        // Log the delivery flowEvent and emailEvent metrics if available
        utils.logFlowEventFromMessage(log, message, 'delivered')
        utils.logEmailEventFromMessage(log, message, 'delivered', emailDomain)

        log.info(logData)
      }).then(
        function () {
          // We always delete the message, even if handling some addrs failed.
          message.del()
        }
      )
    }

    deliveryQueue.on('data', handleDelivery)
    deliveryQueue.start()

    return {
      deliveryQueue: deliveryQueue,
      handleDelivery: handleDelivery
    }
  }
}
