/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const errors = require('../error');
const isA = require('joi');
const validators = require('./validators');
const HEX_STRING = validators.HEX_STRING;
const DIGITS = validators.DIGITS;
const P = require('../promise');

module.exports = (log, db, config, customs) => {
  const tokenCodeConfig = config.signinConfirmation.tokenVerificationCode;
  const TOKEN_CODE_LENGTH =
    (tokenCodeConfig && tokenCodeConfig.codeLength) || 6;

  return [
    {
      method: 'POST',
      path: '/session/verify/token',
      options: {
        auth: {
          strategy: 'sessionToken',
        },
        validate: {
          payload: {
            code: isA
              .string()
              .min(TOKEN_CODE_LENGTH)
              .max(TOKEN_CODE_LENGTH)
              .regex(DIGITS)
              .required(),
            uid: isA
              .string()
              .max(32)
              .regex(HEX_STRING)
              .optional(),
          },
        },
      },
      handler: async function(request) {
        log.begin('session.verify.token', request);

        const code = request.payload.code.toUpperCase();

        const { email, uid } = request.auth.credentials;

        await customs.check(request, email, 'verifyTokenCode');

        // For b/w compat we accept `uid` in the request body,
        // but it must match the uid of the sessionToken.
        if (request.payload.uid && request.payload.uid !== uid) {
          throw errors.invalidRequestParameter('uid');
        }

        try {
          await db.verifyTokenCode(code, { uid });
        } catch (err) {
          if (err.errno === errors.ERRNO.EXPIRED_TOKEN_VERIFICATION_CODE) {
            log.error('account.token.code.expired', { err, uid });
          }

          throw err;
        }

        log.info('account.token.code.verified', { uid });

        await P.all([
          request.emitMetricsEvent('tokenCodes.verified', { uid }),
          request.emitMetricsEvent('account.confirmed', { uid }),
        ]);

        return {};
      },
    },
  ];
};
