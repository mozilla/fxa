/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { authenticator as otplibAuthenticator } from 'otplib';

// Generate a TOTP code matching server settings (hex-encoded secret)
export async function getCode(secretHex: string): Promise<string> {
  const auth = new otplibAuthenticator.Authenticator();
  auth.options = Object.assign({}, otplibAuthenticator.options, {
    encoding: 'hex',
  });
  return auth.generate(secretHex);
}
