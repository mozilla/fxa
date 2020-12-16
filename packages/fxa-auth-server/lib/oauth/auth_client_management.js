/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ScopeSet = require('fxa-shared').oauth.scopes;

const AppError = require('./error');
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
  return {
    authenticate: async function dogfoodStrategy(req, h) {
      const auth = req.headers.authorization;
      if (!auth || auth.indexOf('Bearer ') !== 0) {
        throw AppError.unauthorized('Bearer token not provided');
      }
      const tok = auth.split(' ')[1];

      if (!validators.HEX_STRING.test(tok)) {
        throw AppError.unauthorized('Illegal Bearer token');
      }
      try {
        const details = await token.verify(tok);
        if (details.scope.contains(exports.SCOPE_CLIENT_MANAGEMENT)) {
          const blocked = !WHITELIST.some(function (re) {
            return re.test(details.email);
          });
          if (blocked) {
            throw AppError.forbidden();
          }
        }

        details.scope = details.scope.getScopeValues();
        return h.authenticated({ credentials: details });
      } catch (err) {
        throw AppError.unauthorized('Bearer token invalid');
      }
    },
  };
};
