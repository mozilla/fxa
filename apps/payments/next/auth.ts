/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { setupAuth } from '@fxa/payments/ui-auth';
import { config } from './config';

export { AuthError } from '@fxa/payments/ui-auth';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = setupAuth({
  issuerUrl: config.auth.issuerUrl,
  wellKnownUrl: config.auth.wellKnownUrl,
  tokenUrl: config.auth.tokenUrl,
  userinfoUrl: config.auth.userinfoUrl,
  clientId: config.auth.clientId,
  clientSecret: config.auth.clientSecret,
  contentServerUrl: config.contentServerUrl,
  paymentsNextHostedUrl: config.paymentsNextHostedUrl,
});
