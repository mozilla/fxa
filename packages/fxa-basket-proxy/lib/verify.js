/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const request = require('request');

const config = require('./config');
const logger = require('./logging')('verify');
const basket = require('./basket');

const VERIFY_URL = config.get('oauth_url') + '/v1/verify';
const PROFILE_URL = config.get('fxaccount_url') + '/v1/account/profile';
const REQUIRED_SCOPE_REGEX = /^basket(:write)?$/;

// Adds FxA OAuth token verification to an express app.

module.exports = function verifyOAuthToken() {
  return function(req, res, next) {
    var authHeader = req.headers && req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    if (!authHeader.match(/^Bearer /)) {
      logger.error('auth.invalid-authorization-header');
      res
        .status(400)
        .json(
          basket.errorResponse(
            'invalid authorization header',
            basket.errors.USAGE_ERROR
          )
        );
      return;
    }

    var token = authHeader.replace(/^Bearer /, '');

    logger.info('auth.valid.starting');

    request.post(
      {
        url: VERIFY_URL,
        json: {
          token: token,
        },
      },
      function(err, result, body) {
        if (err) {
          logger.error('auth.error', err);
          res
            .status(500)
            .json(basket.errorResponse(err, basket.errors.UNKNOWN_ERROR));
          return;
        }

        if (result.statusCode >= 400) {
          logger.error('auth.unauthorized', body);
          res
            .status(result.statusCode)
            .json(
              basket.errorResponse('unauthorized', basket.errors.AUTH_ERROR)
            );
          return;
        }

        if (!body.user) {
          logger.error('auth.missing-user', body);
          res
            .status(400)
            .json(
              basket.errorResponse('missing user', basket.errors.AUTH_ERROR)
            );
          return;
        }

        if (!body.scope || !(body.scope instanceof Array)) {
          logger.error('auth.missing-scope', body);
          res
            .status(400)
            .json(
              basket.errorResponse('missing scope', basket.errors.AUTH_ERROR)
            );
          return;
        }

        if (!body.scope.find(s => REQUIRED_SCOPE_REGEX.test(s))) {
          logger.error('auth.invalid-scope', body);
          res
            .status(400)
            .json(
              basket.errorResponse('invalid scope', basket.errors.AUTH_ERROR)
            );
          return;
        }

        logger.info('auth.valid', body);
        res.locals.creds = body;

        logger.info('auth.profile.starting');

        request.get(
          {
            url: PROFILE_URL,
            json: true,
            headers: {
              Authorization: authHeader,
            },
          },
          function(err, result, body) {
            if (err) {
              logger.error('auth.profile.error', err);
              res
                .status(500)
                .json(basket.errorResponse(err, basket.errors.UNKNOWN_ERROR));
              return;
            }

            if (result.statusCode >= 400) {
              logger.error('auth.profile.unauthorized', body);
              res
                .status(result.statusCode)
                .json(
                  basket.errorResponse('unauthorized', basket.errors.AUTH_ERROR)
                );
              return;
            }

            if (!body.email) {
              logger.error('auth.profile.missing-email', body);
              res
                .status(400)
                .json(
                  basket.errorResponse(
                    'missing email',
                    basket.errors.AUTH_ERROR
                  )
                );
              return;
            }

            logger.info('auth.profile');
            res.locals.creds.email = body.email;
            next();
          }
        );
      }
    );
  };
};
