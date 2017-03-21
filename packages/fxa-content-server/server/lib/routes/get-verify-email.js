/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const url = require('url');
const got = require('got');
const logger = require('mozlog')('server.get-verify-email');
const config = require('../configuration');
const ravenClient = require('../../lib/raven').ravenMiddleware;
const joi = require('joi');
const validation = require('../validation');

const fxaAccountUrl = config.get('fxaccount_url');
const STRING_TYPE = validation.TYPES.STRING;

const VERIFICATION_ENDPOINT = `${fxaAccountUrl}/v1/recovery_email/verify_code`;
const VERIFICATION_TIMEOUT = 5000;
// Sentry combines both Info and Error into one if same name
const VERIFICATION_LEVEL_ERROR = 'VerificationValidationError';
const VERIFICATION_LEVEL_INFO = 'VerificationValidationInfo';

const REQUIRED_SCHEMA = {
  'code': joi.string().hex().min(32).max(32).required(),
  'uid': joi.string().hex().min(32).max(32).required()
};

const REPORT_ONLY_SCHEMA = {
  'code': STRING_TYPE.alphanum().min(32).max(32).required(),
  // resume token can be long, do not use the limited STRING_TYPE
  'resume': joi.string().alphanum().optional(),
  'service': STRING_TYPE.alphanum().max(100).optional(),
  'uid': STRING_TYPE.alphanum().min(32).max(32).required(),
  'utm_campaign': STRING_TYPE.alphanum().optional(),
  'utm_content': STRING_TYPE.alphanum().optional(),
  'utm_medium': STRING_TYPE.alphanum().optional(),
  'utm_source': STRING_TYPE.alphanum().optional()
};

module.exports = function () {
  return {
    method: 'get',
    path: '/verify_email',
    process: function (req, res, next) {
      const rawQuery = url.parse(req.url).query;

      // reset the url for the front-end router
      req.url = '/';

      if (req.query.server_verification) {
        return next();
      }

      const data = {
        code: req.query.code,
        uid: req.query.uid
      };

      joi.validate(data, REQUIRED_SCHEMA, (err) => {
        if (err) {
          ravenClient.captureMessage(VERIFICATION_LEVEL_ERROR, {
            extra: {
              details: err.details
            }
          });
          // if cannot validate required params then just forward to front-end
          return next();
        }

        if (req.query.service) {
          data.service = req.query.service;
        }

        if (req.query.reminder) {
          data.reminder = req.query.reminder;
        }

        const options = {
          body: data,
          retries: 0,
          timeout: {
            connect: VERIFICATION_TIMEOUT,
            socket: VERIFICATION_TIMEOUT
          }
        };

        got.post(VERIFICATION_ENDPOINT, options)
          .then(() => {
            // In some cases the code can only be used once.
            // Here we add an extra query param to signal the front-end that verification succeeded.
            // See issue #4800
            return res.redirect(`/verify_email?${rawQuery}&server_verification=verified`);
          })
          .catch((err) => {
            ravenClient.captureError(err);
            logger.error(err);
            // failed to verify, continue to front-end
            next();

          });
      });

      // Passive validation and error reporting, could be made required in the future.
      joi.validate(req.query, REPORT_ONLY_SCHEMA, (err) => {
        if (err) {
          ravenClient.captureMessage(VERIFICATION_LEVEL_INFO, {
            extra: {
              details: err.details
            },
            level: 'info'
          });
        }
      });

    }
  };
};
