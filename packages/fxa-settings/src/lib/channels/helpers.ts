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

export function notifyFirefoxOfLogin(
  accountData: FxALoginRequest,
  isSessionVerified: boolean
) {
  /* Only notify the browser of the login if the user 1) does not have to
   * verify their account/session and 2) when all required fields are present,
   * which is a workaround for #3078. If the user signs up but does not
   * verify their account, then visit `/` or `/settings`, they are
   * redirected to `/confirm` which attempts to notify the browser of
   * login. Since `unwrapBKey` and `keyFetchToken` are not persisted to
   * disk, the passed in account lacks these items. The browser can't
   * do anything without this data, so don't actually send the message. */

  if (
    !isSessionVerified ||
    !accountData.verified ||
    !REQUIRED_LOGIN_FIELDS.every((key) => key in accountData)
  ) {
    return;
  }

  // TODO: account for multiservice TODO with FXA-6488 or follow up
  // const isMultiService = this.relier && this.relier.get('multiService');
  // if (isMultiService) {
  //   loginData = this._formatForMultiServiceBrowser(loginData);
  // }

  // TODO with FXA-6488 or follow up
  // Only send one login notification per uid to avoid race
  // conditions within the browser. Two attempts to send
  // a login message occur for users that verify while
  // at the /confirm screen. The first attempt is made when
  // /confirm is first displayed, the 2nd when verification
  // completes.
  // if (loginData.uid !== uidOfLoginNotification) {
  //   uidOfLoginNotification = loginData.uid;

  firefox.fxaLogin(accountData);
}
