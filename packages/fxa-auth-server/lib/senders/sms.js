/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const AWS = require('aws-sdk')
const MockSNS = require('../../test/mock-sns')
const P = require('bluebird')
const error = require('../error')

module.exports = (log, translator, templates, config) => {
  const smsConfig = config.sms
  const smsOptions = {
    region: smsConfig.apiRegion
  }
  let SNS
  if (smsConfig.useMock) {
    SNS = new MockSNS(smsOptions, config)
  } else {
    SNS = new AWS.SNS(smsOptions)
  }

  return {
    send (phoneNumber, templateName, acceptLanguage, signinCode) {
      log.trace({ op: 'sms.send', templateName, acceptLanguage })

      return P.resolve()
        .then(() => {
          const message = getMessage(templateName, acceptLanguage, signinCode)
          const params = {
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
            .then(result => {
              log.info({
                op: 'sms.send.success',
                templateName,
                acceptLanguage,
                messageId: result.MessageId
              })
            })
            .catch(sendError => {
              const { message, code, statusCode } = sendError
              log.error({ op: 'sms.send.error', message, code, statusCode })

              throw error.messageRejected(message, code)
            })
        })
    }
  }

  function getMessage (templateName, acceptLanguage, signinCode) {
    const template = templates[`sms.${templateName}`]

    if (! template) {
      log.error({ op: 'sms.getMessage.error', templateName })
      throw error.invalidMessageId()
    }

    let link
    if (signinCode) {
      link = `${smsConfig.installFirefoxWithSigninCodeBaseUri}/${urlSafeBase64(signinCode)}`
    } else {
      link = smsConfig[`${templateName}Link`]
    }

    return template({ link, translator: translator.getTranslator(acceptLanguage) }).text
  }

  function urlSafeBase64 (hex) {
    return Buffer.from(hex, 'hex')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
}
