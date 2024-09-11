/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AppError from '../../error';

import token from '../../oauth/token';

const authName = 'fxa-oauth';

export { authName as AUTH_SCHEME };

export const strategy = function () {
  return {
    authenticate: async function (req, h) {
      const auth = req.headers.authorization;

      if (!auth || auth.indexOf('Bearer') !== 0) {
        throw AppError.unauthorized('Bearer token not provided');
      }

      const tok = auth.split(' ')[1];

      try {
        const info = await token.verify(tok);
        info.scope = info.scope.getScopeValues();
        return h.authenticated({
          credentials: info,
        });
      } catch (err) {
        throw AppError.unauthorized('Bearer token invalid');
      }
    },
  };
};
