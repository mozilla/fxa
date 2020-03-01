/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const error = require('../error');
const isA = require('@hapi/joi');
const PhoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
const validators = require('./validators');

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').schema;
const FEATURES_SCHEMA = require('../features').schema;
const TEMPLATE_NAMES = new Map([[1, 'installFirefox']]);

module.exports = (log, db, config, customs, sms) => {
  if (!config.sms.enabled) {
    return [];
  }

  const REGIONS = new Set(config.sms.countryCodes);
  const IS_STATUS_GEO_ENABLED = config.sms.isStatusGeoEnabled;

  return [
    {
      method: 'POST',
      path: '/sms',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            phoneNumber: isA
              .string()
              .regex(validators.E164_NUMBER)
              .required(),
            messageId: isA
              .number()
              .positive()
              .required(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
            features: FEATURES_SCHEMA,
          },
        },
      },
      handler: async function(request) {
        log.begin('sms.send', request);
        request.validateMetricsContext();

        const sessionToken = request.auth.credentials;
        const { messageId, phoneNumber } = request.payload;
        const templateName = TEMPLATE_NAMES.get(messageId);
        const acceptLanguage = request.app.acceptLanguage;

        await customs.check(request, sessionToken.email, 'connectDeviceSms');

        let phoneNumberUtil, parsedPhoneNumber;
        try {
          phoneNumberUtil = PhoneNumberUtil.getInstance();
          parsedPhoneNumber = phoneNumberUtil.parse(phoneNumber);
        } catch (err) {
          throw error.invalidPhoneNumber();
        }

        if (!phoneNumberUtil.isValidNumber(parsedPhoneNumber)) {
          throw error.invalidPhoneNumber();
        }

        const region = phoneNumberUtil.getRegionCodeForNumber(
          parsedPhoneNumber
        );
        await request.emitMetricsEvent(`sms.region.${region}`);

        if (!REGIONS.has(region)) {
          throw error.invalidRegion(region);
        }

        let signinCode;
        if (request.app.features.has('signinCodes')) {
          const metricsContext = await request.gatherMetricsContext({});
          signinCode = await db.createSigninCode(
            sessionToken.uid,
            metricsContext.flow_id
          );
        }

        await sms.send(phoneNumber, templateName, acceptLanguage, signinCode);
        await request.emitMetricsEvent(`sms.${templateName}.sent`);

        return {
          formattedPhoneNumber: phoneNumberUtil.format(
            parsedPhoneNumber,
            'international'
          ),
        };
      },
    },
    {
      method: 'GET',
      path: '/sms/status',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          query: {
            country: isA
              .string()
              .regex(/^[A-Z][A-Z]$/)
              .optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('sms.status', request);

        let country;

        return createResponse(getLocation());

        function getLocation() {
          country = request.query.country;

          if (!country) {
            if (!IS_STATUS_GEO_ENABLED) {
              log.warn('sms.getGeoData', {
                warning: 'skipping geolocation step',
              });
              return true;
            }

            const location = request.app.geo.location;
            if (location && location.countryCode) {
              country = location.countryCode;
            }
          }

          if (country) {
            return REGIONS.has(country);
          }

          log.error('sms.getGeoData', { err: 'missing location data' });
          return false;
        }

        function createResponse(isLocationOk) {
          return { ok: isLocationOk && sms.isBudgetOk(), country };
        }
      },
    },
  ];
};
