/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('../../../fxa-shared').oauth.scopes;

const AppError = require('./error');
const logger = require('./logging')('server.auth');
const token = require('./token');
const validators = require('./validators');

const WHITELIST = require('../../config')
  .get('oauthServer.admin.whitelist')
  .map(function (re) {
    return new RegExp(re);
  });

exports.AUTH_STRATEGY = 'dogfood';
exports.AUTH_SCHEME = 'bearer';

exports.SCOPE_CLIENT_MANAGEMENT = ScopeSet.fromArray(['oauth']);

exports.strategy = function () {
  logger.verbose('auth_client.whitelist', WHITELIST);

  return {
    authenticate: async function dogfoodStrategy(req, h) {
      var auth = req.headers.authorization;
      logger.debug('check.auth', { header: auth });
      if (!auth || auth.indexOf('Bearer ') !== 0) {
        throw AppError.unauthorized('Bearer token not provided');
      }
      var tok = auth.split(' ')[1];

      if (!validators.HEX_STRING.test(tok)) {
        throw AppError.unauthorized('Illegal Bearer token');
      }

      return token.verify(tok).then(
        function tokenFound(details) {
          if (details.scope.contains(exports.SCOPE_CLIENT_MANAGEMENT)) {
            logger.debug('check.whitelist');
            var blocked = !WHITELIST.some(function (re) {
              return re.test(details.email);
            });
            if (blocked) {
              logger.warn('whitelist.blocked', {
                email: details.email,
                token: tok,
              });
              throw AppError.forbidden();
            }
          }

          logger.info('success', details);
          details.scope = details.scope.getScopeValues();
          return h.authenticated({ credentials: details });
        },
        function noToken(err) {
          logger.debug('error', err);
          throw AppError.unauthorized('Bearer token invalid');
        }
      );
    },
  };
};
