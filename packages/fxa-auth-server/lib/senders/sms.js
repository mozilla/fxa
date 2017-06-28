/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

var AWS = require('aws-sdk')
var MockSNS = require('../../test/mock-sns')
var P = require('bluebird')
var error = require('../error')

module.exports = function (log, translator, templates, config) {
  var smsConfig = config.sms
  var smsOptions = {
    region: smsConfig.apiRegion
  }
  var SNS
  if (smsConfig.useMock) {
    SNS = new MockSNS(smsOptions, config)
  } else {
    SNS = new AWS.SNS(smsOptions)
  }

  return {
    send: function (phoneNumber, templateName, acceptLanguage, signinCode) {
      log.trace({
        op: 'sms.send',
        templateName: templateName,
        acceptLanguage: acceptLanguage
      })

      return P.resolve()
        .then(function () {
          var message = getMessage(templateName, acceptLanguage, signinCode)
          var params = {
            Message: message.trim(),
            MessageAttributes: {
              'AWS.SNS.SMS.MaxPrice': {
                // The maximum amount in USD that you are willing to spend to send the SMS message.
                DataType: 'String',
                StringValue: '1.0'
              },
              'AWS.SNS.SMS.SenderID': {
                // Up to 11 alphanumeric characters, including at least one letter and no spaces
                DataType: 'String',
                StringValue: 'Firefox'
              },
              'AWS.SNS.SMS.SMSType': {
                // 'Promotional' for cheap marketing messages, 'Transactional' for critical transactions
                DataType: 'String',
                StringValue: 'Promotional'
              }
            },
            PhoneNumber: phoneNumber
          }

          return SNS.publish(params).promise()
            .then(function (result) {
              log.info({
                op: 'sms.send.success',
                templateName: templateName,
                acceptLanguage: acceptLanguage,
                messageId: result.MessageId
              })
            })
            .catch(function (sendError) {
              log.error({
                op: 'sms.send.error',
                message: sendError.message,
                code: sendError.code,
                statusCode: sendError.statusCode
              })

              throw error.messageRejected(sendError.message, sendError.code)
            })
        })
    }
  }

  function getMessage (templateName, acceptLanguage, signinCode) {
    var template = templates['sms.' + templateName]

    if (! template) {
      log.error({ op: 'sms.getMessage.error', templateName: templateName })
      throw error.invalidMessageId()
    }

    var link
    if (signinCode) {
      link = smsConfig.installFirefoxWithSigninCodeBaseUri + '/' + urlSafeBase64(signinCode)
    } else {
      link = smsConfig[templateName + 'Link']
    }

    return template({
      link: link,
      translator: translator.getTranslator(acceptLanguage)
    }).text
  }

  function urlSafeBase64 (buffer) {
    return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }
}
