/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import ScopeSetModule from "fxa-shared";

const ScopeSet = ScopeSetModule.oauth.scopes;

import OauthError from './error';
import token from './token';
import * as validators from './validators';

import WHITELISTModule from "../../config";

const WHITELIST = WHITELISTModule.map(function (re) {
    return new RegExp(re);
  });

export const AUTH_STRATEGY = 'dogfood';
export const AUTH_SCHEME = 'bearer';
export const SCOPE_CLIENT_MANAGEMENT = ScopeSet.fromArray(['oauth']);

export const strategy = function () {
  return {
    authenticate: async function dogfoodStrategy(req, h) {
      const auth = req.headers.authorization;
      if (!auth || auth.indexOf('Bearer ') !== 0) {
        throw OauthError.unauthorized('Bearer token not provided');
      }
      const tok = auth.split(' ')[1];

      if (!validators.HEX_STRING.test(tok)) {
        throw OauthError.unauthorized('Illegal Bearer token');
      }
      try {
        const details = await token.verify(tok);
        if (details.scope.contains(exports.SCOPE_CLIENT_MANAGEMENT)) {
          const blocked = !WHITELIST.some(function (re) {
            return re.test(details.email);
          });
          if (blocked) {
            throw OauthError.forbidden();
          }
        }

        details.scope = details.scope.getScopeValues();
        return h.authenticated({ credentials: details });
      } catch (err) {
        throw OauthError.unauthorized('Bearer token invalid');
      }
    },
  };
};
