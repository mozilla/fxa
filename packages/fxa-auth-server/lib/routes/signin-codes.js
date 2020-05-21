/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const isA = require('@hapi/joi');
const validators = require('./validators');

const METRICS_CONTEXT_SCHEMA = require('../metrics/context').requiredSchema;
const qrcode = require('qrcode');
const requestHelper = require('./utils/request_helper');

module.exports = (log, db, customs, config) => {
  // Currently, QR codes are rendered with the highest possible
  // error correction, which should in theory allow clients to
  // scan the image better.
  // Ref: https://github.com/soldair/node-qrcode#error-correction-level
  const qrCodeOptions = { errorCorrectionLevel: 'H' };

  return [
    {
      method: 'POST',
      path: '/signinCodes/consume',
      options: {
        validate: {
          payload: {
            code: isA
              .string()
              .regex(validators.URL_SAFE_BASE_64)
              .required(),
            metricsContext: METRICS_CONTEXT_SCHEMA,
          },
        },
        response: {
          schema: {
            email: validators.email().required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('signinCodes.consume', request);
        request.validateMetricsContext();

        await customs.checkIpOnly(request, 'consumeSigninCode');

        let base64 = request.payload.code.replace(/-/g, '+').replace(/_/g, '/');

        const padCount = base64.length % 4;
        for (let i = 0; i < padCount; ++i) {
          base64 += '=';
        }

        const hex = Buffer.from(base64, 'base64').toString('hex');

        const result = await db.consumeSigninCode(hex);
        await request.emitMetricsEvent('signinCode.consumed');

        if (result.flowId) {
          await request.emitMetricsEvent(`flow.continued.${result.flowId}`);
        }

        return { email: result.email };
      },
    },
    {
      method: 'POST',
      path: '/signinCodes',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        response: {
          schema: {
            code: isA.string().required(),
            installQrCode: isA.string().required(),
            link: isA.string().required(),
          },
        },
      },
      handler: async function(request) {
        log.begin('signinCodes', request);

        const sessionToken = request.auth.credentials;

        const metricsContext = await request.gatherMetricsContext({});
        const signinCode = await db.createSigninCode(
          sessionToken.uid,
          metricsContext.flow_id
        );

        const link = `${
          config.sms.installFirefoxWithSigninCodeBaseUri
        }/${requestHelper.urlSafeBase64(signinCode)}`;
        const installQrCode = await qrcode.toDataURL(link, qrCodeOptions);

        return {
          code: signinCode,
          installQrCode,
          link,
        };
      },
    },
  ];
};
