/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import firefox, { FxALoginRequest } from './firefox';

// TODO: might need to go on Integration?
// let uidOfLoginNotification: hexstring = '';

const REQUIRED_LOGIN_FIELDS: Array<keyof FxALoginRequest> = [
  'authAt',
  'email',
  'keyFetchToken',
  'sessionToken',
  'uid',
  'unwrapBKey',
  'verified',
];

export function notifyFirefoxOfLogin(accountData: FxALoginRequest) {
  if (!REQUIRED_LOGIN_FIELDS.every((key) => key in accountData)) {
    return;
  }

  // TODO: account for multiservice TODO with FXA-6488 or follow up
  // const isMultiService = this.relier && this.relier.get('multiService');
  // if (isMultiService) {
  //   loginData = this._formatForMultiServiceBrowser(loginData);
  // }

  firefox.fxaLogin(accountData);
}
