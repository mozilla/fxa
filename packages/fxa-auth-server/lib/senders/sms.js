/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var Nexmo = require('nexmo')
var P = require('bluebird')

var TEMPLATE_NAMES = new Map([
  [ 1, 'installFirefox' ]
])

module.exports = function (log, translator, templates, smsConfig) {
  var nexmo = new Nexmo({
    apiKey: smsConfig.apiKey,
    apiSecret: smsConfig.apiSecret
  })
  var sendSms = promisify('sendSms', nexmo.message)
  var checkBalance = promisify('checkBalance', nexmo.account)

  return {
    send: function (phoneNumber, senderId, messageId, acceptLanguage) {
      log.trace({
        op: 'sms.send',
        senderId: senderId,
        messageId: messageId,
        acceptLanguage: acceptLanguage
      })

      return P.resolve()
        .then(function () {
          var message = getMessage(messageId, acceptLanguage)

          return sendSms(senderId, phoneNumber, message.trim())
        })
        .then(function (result) {
          var resultCount = result.messages && result.messages.length
          if (resultCount !== 1) {
            // I don't expect this condition to be entered, certainly I haven't
            // seen it in testing. But because I'm making an assumption about
            // the result format, I want to log an error if my assumption proves
            // to be wrong in production.
            log.error({ op: 'sms.send', err: new Error('Unexpected result count'), resultCount: resultCount })
          }

          result = result.messages[0]
          var status = result.status

          // https://docs.nexmo.com/messaging/sms-api/api-reference#status-codes
          if (status === '0') {
            log.info({
              op: 'sms.send.success',
              senderId: senderId,
              messageId: messageId,
              acceptLanguage: acceptLanguage
            })
          } else {
            var reason = result['error-text']
            fail('Message rejected', {
              status: 500,
              reason: reason,
              reasonCode: status
            })
          }
        })
    },

    balance: function () {
      log.trace({ op: 'sms.balance' })

      return checkBalance()
        .then(function (result) {
          var balance = result.value
          var isOk = balance >= smsConfig.balanceThreshold

          log.info({ op: 'sms.balance.success', balance: balance, isOk: isOk })

          return { value: balance, isOk: isOk }
        })
    }
  }

  function promisify (methodName, object) {
    return P.promisify(object[methodName], { context: object })
  }

  function getMessage (messageId, acceptLanguage) {
    var templateName = TEMPLATE_NAMES.get(messageId)
    var template = templates['sms.' + templateName]

    if (! template) {
      fail('Invalid message id', { status: 400 })
    }

    return template({
      link: smsConfig[templateName + 'Link'],
      translator: translator(acceptLanguage)
    }).text
  }

  // If/when fxa-auth-mailer is moved into the auth server repo,
  // calls to this function can be replaced with the auth server's
  // AppError methods directly.
  function fail (message, properties) {
    log.error({ op: 'sms.send', err: message })

    var error = new Error(message)
    if (properties) {
      Object.keys(properties).forEach(function (key) {
        error[key] = properties[key]
      })
    }

    throw error
  }
}
