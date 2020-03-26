/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const Joi = require('@hapi/joi');

const AppError = require('../error');
const config = require('../config');
const logger = require('../logging')('routes._core_profile');
const request = require('../request');

const AUTH_SERVER_URL = config.get('authServer.url') + '/account/profile';

/**
 * This is an internal-use route that retreives all the user
 * profile data available from the auth-server.  Various public
 * routes can call into it and return a subset of the info.
 */
module.exports = {
  isInternal: true,
  auth: {
    strategy: 'oauth',
    scope: [
      'profile:email',
      'profile:locale',
      'profile:amr',
      'profile:subscriptions',
      /* openid-connect scope */ 'email',
    ],
  },
  response: {
    schema: {
      email: Joi.string().optional(),
      locale: Joi.string().optional(),
      amrValues: Joi.array()
        .items(Joi.string().required())
        .optional(),
      twoFactorAuthentication: Joi.boolean().optional(),
      subscriptions: Joi.array()
        .items(Joi.string().required())
        .optional(),
      subscriptionsByClientId: Joi.object()
        .unknown(true)
        .optional(),
      profileChangedAt: Joi.number().optional(),
    },
  },
  handler: async function _core_profile(req) {
    function makeReq() {
      return new Promise((resolve, reject) => {
        request.get(
          AUTH_SERVER_URL,
          {
            headers: {
              Authorization: 'Bearer ' + req.auth.credentials.token,
            },
            json: true,
          },
          (err, res, body) => {
            if (err) {
              logger.error('request.auth_server.network', err);
              return reject(new AppError.authError('network error'));
            }
            if (res.statusCode >= 400) {
              body = body && body.code ? body : { code: res.statusCode };
              if (res.statusCode >= 500) {
                logger.error('request.auth_server.fail', body);
                return reject(
                  new AppError.authError('auth-server server error')
                );
              }
              // Return Unauthorized if the token turned out to be invalid,
              // or if the account has been deleted on the auth-server.
              // (we can still have valid oauth tokens for deleted accounts,
              // because distributed state).
              if (body.code === 401 || body.errno === 102) {
                logger.info('request.auth_server.fail', body);
                return reject(new AppError.unauthorized(body.message));
              }
              // There should be no other 400-level errors, unless we're
              // sending a badly-formed request of our own.  That warrants
              // an "Internal Server Error" on our part.
              logger.error('request.auth_server.fail', body);
              return reject(
                new AppError({
                  code: 500,
                  message: 'error communicating with auth server',
                })
              );
            }

            if (!body) {
              return reject(new AppError('empty body from auth response'));
            }
            const result = {};
            if (typeof body.email !== 'undefined') {
              result.email = body.email;
            }
            if (typeof body.locale !== 'undefined') {
              result.locale = body.locale;
            }
            // Translate from internal terminology into OAuth-style terminology.
            if (typeof body.authenticationMethods !== 'undefined') {
              result.amrValues = body.authenticationMethods;
            }
            if (typeof body.authenticatorAssuranceLevel !== 'undefined') {
              result.twoFactorAuthentication =
                body.authenticatorAssuranceLevel >= 2;
            }
            if (typeof body.subscriptions !== 'undefined') {
              result.subscriptions = body.subscriptions;
            }
            if (typeof body.subscriptionsByClientId !== 'undefined') {
              result.subscriptionsByClientId = body.subscriptionsByClientId;
            }
            if (typeof body.profileChangedAt !== 'undefined') {
              result.profileChangedAt = body.profileChangedAt;
            }
            return resolve(result);
          }
        );
      });
    }

    return makeReq();
  },
};
