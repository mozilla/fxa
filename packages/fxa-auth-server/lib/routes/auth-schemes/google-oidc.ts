/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { OAuth2Client } from 'google-auth-library';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { AppError } from '@fxa/accounts/errors';

export const strategy = ({
  aud,
  serviceAccountEmail,
}: {
  aud: string;
  serviceAccountEmail: string;
}) => {
  const googleAuthClient = new OAuth2Client();

  return () => ({
    authenticate: async function (req: Request, h: ResponseToolkit) {
      const auth = req.headers.authorization;

      if (!auth || auth.indexOf('Bearer') !== 0) {
        throw AppError.unauthorized('Bearer token not provided');
      }

      const tok = auth.split(' ')[1];

      try {
        const info = await googleAuthClient.verifyIdToken({
          idToken: tok,
          audience: aud,
        });
        if (info.getPayload()?.email !== serviceAccountEmail) {
          throw new Error('Email address does not match.');
        }
        return h.authenticated({
          credentials: info.getPayload() as Record<string, any>,
        });
      } catch (err) {
        throw AppError.unauthorized(`Bearer token invalid: ${err.message}`);
      }
    },
  });
};
