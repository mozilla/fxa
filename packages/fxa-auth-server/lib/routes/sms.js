/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict'

const error = require('../error')
const isA = require('joi')
const PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil
const validators = require('./validators')

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema
const FEATURES_SCHEMA = require('../features').schema
const TEMPLATE_NAMES = new Map([
  [ 1, 'installFirefox' ]
])

module.exports = (log, db, config, customs, sms) => {
  if (! config.sms.enabled) {
    return []
  }

  const REGIONS = new Set(config.sms.countryCodes)
  const IS_STATUS_GEO_ENABLED = config.sms.isStatusGeoEnabled

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
            metricsContext: METRICS_CONTEXT_SCHEMA,
            features: FEATURES_SCHEMA
          }
        }
      },
      handler (request, reply) {
        log.begin('sms.send', request)
        request.validateMetricsContext()

        const sessionToken = request.auth.credentials
        const phoneNumber = request.payload.phoneNumber
        const templateName = TEMPLATE_NAMES.get(request.payload.messageId)
        const acceptLanguage = request.app.acceptLanguage

        let phoneNumberUtil, parsedPhoneNumber

        customs.check(request, sessionToken.email, 'connectDeviceSms')
          .then(parsePhoneNumber)
          .then(validatePhoneNumber)
          .then(validateRegion)
          .then(createSigninCode)
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

        function validateRegion () {
          const region = phoneNumberUtil.getRegionCodeForNumber(parsedPhoneNumber)
          request.emitMetricsEvent(`sms.region.${region}`)

          if (! REGIONS.has(region)) {
            throw error.invalidRegion(region)
          }
        }

        function createSigninCode () {
          if (request.app.features.has('signinCodes')) {
            return request.gatherMetricsContext({})
              .then(metricsContext => db.createSigninCode(sessionToken.uid, metricsContext.flow_id))
          }
        }

        function sendMessage (signinCode) {
          return sms.send(phoneNumber, templateName, acceptLanguage, signinCode)
        }

        function logSuccess () {
          return request.emitMetricsEvent(`sms.${templateName}.sent`)
        }

        function createResponse () {
          return {
            formattedPhoneNumber: phoneNumberUtil.format(parsedPhoneNumber, 'international')
          }
        }
      }
    },
    {
      method: 'GET',
      path: '/sms/status',
      config: {
        auth: {
          strategy: 'sessionToken'
        },
        validate: {
          query: {
            country: isA.string().regex(/^[A-Z][A-Z]$/).optional()
          }
        }
      },
      handler (request, reply) {
        log.begin('sms.status', request)

        let country

        reply(createResponse(getLocation()))

        function getLocation () {
          country = request.query.country

          if (! country) {
            if (! IS_STATUS_GEO_ENABLED) {
              log.warn({ op: 'sms.getGeoData', warning: 'skipping geolocation step' })
              return true
            }

            const location = request.app.geo.location
            if (location && location.countryCode) {
              country = location.countryCode
            }
          }

          if (country) {
            return REGIONS.has(country)
          }

          log.error({ op: 'sms.getGeoData', err: 'missing location data' })
          return false
        }

        function createResponse (isLocationOk) {
          return { ok: isLocationOk, country }
        }
      }
    }
  ]
}

