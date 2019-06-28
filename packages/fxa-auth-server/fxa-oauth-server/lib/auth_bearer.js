/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;

const AppError = require('./error');
const logger = require('./logging')('server.auth_bearer');
const token = require('./token');
const validators = require('./validators');

const authName = 'authBearer';
const authOAuthScope = ScopeSet.fromArray(['clients:write']);

exports.AUTH_STRATEGY = authName;
exports.AUTH_SCHEME = authName;

exports.SCOPE_CLIENT_WRITE = authOAuthScope;

exports.strategy = function() {
  return {
    authenticate: async function authBearerStrategy(req, h) {
      var auth = req.headers.authorization;

      logger.debug(authName + '.check', { header: auth });
      if (!auth || auth.indexOf('Bearer ') !== 0) {
        throw AppError.unauthorized('Bearer token not provided');
      }
      var tok = auth.split(' ')[1];

      if (!validators.HEX_STRING.test(tok)) {
        throw AppError.unauthorized('Illegal Bearer token');
      }

      return token.verify(tok).then(
        function tokenFound(details) {
          logger.info(authName + '.success', details);
          details.scope = details.scope.getScopeValues();
          return h.authenticated({
            credentials: details,
          });
        },
        function noToken(err) {
          logger.debug(authName + '.error', err);
          throw AppError.unauthorized('Bearer token invalid');
        }
      );
    },
  };
};
