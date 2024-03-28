/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import AppError from '../../error';
import { parseAuthorizationHeader } from '@hapi/hawk/lib/utils';
import { Request, ResponseToolkit } from '@hapi/hapi';

/**
 * This function defines the authentication strategy for `hawk-fxa-token`.
 * This auth strategy supports Hawk token and FxA token (Session, KeyFetch, PasswordForgotToken) for authentication as a Bearer token.
 * This strategy will be used to slowly phase out the usage of Hawk tokens, see https://github.com/mozilla/fxa/blob/main/docs/adr/0022-deprecate-hawk.md
 * @param {Function} getCredentialsFunc - The function to get the credentials.
 * @returns {Function}
 */
export function strategy(
  getCredentialsFunc: (tokenId: string) => Promise<any>
) {
  return function () {
    return {
      authenticate: async function (req: Request, h: ResponseToolkit) {
        const auth = req.headers.authorization;
        let tokenId: string | null = null;

        if (!auth) {
          throw AppError.unauthorized('Token not provided');
        }

        if (auth.indexOf('Bearer') > -1) {
          tokenId = auth.split(' ')[1];
        } else if (auth.indexOf('Hawk') > -1) {
          const parsedHeader = parseAuthorizationHeader(auth);
          tokenId = parsedHeader.id;
        }

        if (!tokenId) {
          throw AppError.unauthorized('Token not provided');
        }

        const token = await getCredentialsFunc(tokenId);
        return h.authenticated({
          credentials: token,
        });
      },
      payload: async function (req: Request, h: ResponseToolkit) {
        // Since we skip Hawk header validation, we don't need to perform payload validation either
        return h.continue;
      },
    };
  };
}
