/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is basically a RPC endpoint for the frontend to resolve a domain to see
 * if it has MX record, A record, or neither.
 */

'use strict';

const joi = require('joi');
const VError = require('verror');
const emailValidator = require('fxa-shared/email/validateEmail');
const emailValidatorErrors = require('fxa-shared/email/emailValidatorErrors');
const tryResolveMx = emailValidator.tryResolveMx;
const tryResolveIpv4 = emailValidator.tryResolveIpv4;
const WrappedErrorCodes = emailValidatorErrors.WrappedErrorCodes;

const results = ['MX', 'A', 'none', 'skip'].reduce((accumulator, val) => {
  accumulator[val] = val;
  return accumulator;
}, {});

module.exports = function (config) {
  return {
    method: 'get',
    path: '/validate-email-domain',
    validate: {
      query: {
        domain: joi.string().hostname().required(),
      },
    },
    process: async function (req, res, next) {
      const { domain } = req.query;
      const shouldValidate = config.get('mxRecordValidation.enabled');
      if (!shouldValidate) {
        return res.json({ result: results.skip });
      }
      try {
        if (await tryResolveMx(domain)) {
          return res.json({ result: results.MX });
        }
        if (await tryResolveIpv4(domain)) {
          return res.json({ result: results.A });
        }
        return res.json({ result: results.none });
      } catch (err) {
        if (WrappedErrorCodes.includes(err.code)) {
          next(new VError.WError(err, `DNS query error: ${err.code}`));
        } else {
          next(err);
        }
      }
    },
  };
};
