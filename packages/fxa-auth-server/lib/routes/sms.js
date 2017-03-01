/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const P = require('../promise')
const PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil
const validators = require('./validators')

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema
const SENDER_IDS = new Map(require('../../config/sms-sender-ids.json'))

module.exports = (log, isA, error, config, customs, sms) => {
  if (! config.sms.enabled) {
    return []
  }

  const getGeoData = require('../geodb')(log)
  const REGIONS = config.sms.regions

  return [
    {
      method: 'POST',
      path: '/sms',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          payload: {
            phoneNumber: isA.string().regex(validators.E164_NUMBER).required(),
            messageId: isA.number().positive().required(),
            metricsContext: METRICS_CONTEXT_SCHEMA
          }
        }
      },
      handler (request, reply) {
        log.begin('sms.send', request)
        request.validateMetricsContext()

        const sessionToken = request.auth.credentials
        const phoneNumber = request.payload.phoneNumber
        const messageId = request.payload.messageId
        const acceptLanguage = request.app.acceptLanguage

        let phoneNumberUtil, parsedPhoneNumber

        customs.check(request, sessionToken.email, 'connectDeviceSms')
          .then(parsePhoneNumber)
          .then(validatePhoneNumber)
          .then(getRegionSpecificSenderId)
          .then(sendMessage)
          .then(logSuccess)
          .then(createResponse)
          .then(reply, reply)

        function parsePhoneNumber () {
          phoneNumberUtil = PhoneNumberUtil.getInstance()
          parsedPhoneNumber = phoneNumberUtil.parse(phoneNumber)
        }

        function validatePhoneNumber () {
          if (! phoneNumberUtil.isValidNumber(parsedPhoneNumber)) {
            throw error.invalidPhoneNumber()
          }
        }

        function getRegionSpecificSenderId () {
          const region = phoneNumberUtil.getRegionCodeForNumber(parsedPhoneNumber)
          const senderId = SENDER_IDS.get(region)

          if (! senderId) {
            throw error.invalidRegion(region)
          }

          return senderId
        }

        function sendMessage (senderId) {
          return sms.send(phoneNumber, senderId, messageId, acceptLanguage)
            .catch(err => {
              if (err) {
                if (err.status === 500) {
                  throw error.messageRejected(err.reason, err.reasonCode)
                }

                if (err.status === 400) {
                  throw error.invalidMessageId()
                }
              }

              throw error.unexpectedError()
            })
        }

        function logSuccess () {
          return request.emitMetricsEvent(`sms.${messageId}.sent`)
        }

        function createResponse () {
          return {}
        }
      }
    },
    {
      method: 'GET',
      path: '/sms/status',
      config: {
        auth: {
          strategy: 'sessionToken'
        }
      },
      handler (request, reply) {
        log.begin('sms.status', request)

        return P.all([ getLocation(), getBalance() ])
          .spread(createResponse)
          .then(reply, reply)

        function getLocation () {
          return getGeoData(request.app.clientAddress)
            .then(result => REGIONS.test(result.location.countryCode))
            .catch(err => {
              log.error({ op: 'sms.getGeoData', err: err })
              throw error.unexpectedError()
            })
        }

        function getBalance () {
          return sms.balance()
            .then(balance => balance.isOk)
            .catch(err => {
              log.error({ op: 'sms.balance', err: err })
              throw error.unexpectedError()
            })
        }

        function createResponse (isLocationOk, isBalanceOk) {
          return { ok: isLocationOk && isBalanceOk }
        }
      }
    }
  ]
}

