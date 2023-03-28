/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { AccountData } from '../../models';

const ALLOWED_LOGIN_FIELDS = [
  'declinedSyncEngines',
  'email',
  'keyFetchToken',
  'offeredSyncEngines',
  'sessionToken',
  'services',
  'uid',
  'unwrapBKey',
  'verified',
];

const REQUIRED_LOGIN_FIELDS = [
  'email',
  'keyFetchToken',
  'sessionToken',
  'uid',
  'unwrapBKey',
  'verified',
];

// Might need to go on the Integration?
// let uidOfLoginNotification: hexstring = '';

// function hasRequiredLoginFields(loginData) {
//   const loginFields = Object.keys(loginData);
//   return (
//     REQUIRED_LOGIN_FIELDS.filter((field) => !loginFields.includes(field))
//       .length === 0
//   );
// }

/**
 * Get login data from `account` to send to the browser.
 * All returned keys have a defined value.
 */
// function getLoginData(account: AccountData) {
// let loginData: Partial<AccountData> = {};
// for (const key of ALLOWED_LOGIN_FIELDS) {
//   loginData[key] = account[key];
// }
//   // TODO: account for multiservice when we combine reliers
//   // const isMultiService = this.relier && this.relier.get('multiService');
//   // if (isMultiService) {
//   //   loginData = this._formatForMultiServiceBrowser(loginData);
//   // }
//   loginData.verified = !!loginData.verified;
//   // TODO: this is set in the `beforeSignIn` auth-broker method
//   // loginData.verifiedCanLinkAccount = !!this._verifiedCanLinkEmail;
//   return Object.fromEntries(
//     Object.entries(loginData).filter(([key, value]) => value !== undefined)
//   );
// }

// TODO in FXA-7172
export function notifyFirefoxOfLogin(
  account: AccountData,
  isSessionVerified: boolean
) {
  // only notify the browser of the login if the user does not have
  // to verify their account/session
  if (!isSessionVerified) {
    return;
  }

  /**
   * Workaround for #3078. If the user signs up but does not verify
   * their account, then visit `/` or `/settings`, they are
   * redirected to `/confirm` which attempts to notify the browser of
   * login. Since `unwrapBKey` and `keyFetchToken` are not persisted to
   * disk, the passed in account lacks these items. The browser can't
   * do anything without this data, so don't actually send the message.
   *
   * Also works around #3514. With e10s enabled, localStorage in
   * about:accounts and localStorage in the verification page are not
   * shared. This lack of shared state causes the original tab of
   * a password reset from about:accounts to not have all the
   * required data. The verification tab sends a WebChannel message
   * already, so no need here too.
   */
  // const loginData = getLoginData(account);
  // if (!hasRequiredLoginFields(loginData)) {
  //   return;
  // }

  // Only send one login notification per uid to avoid race
  // conditions within the browser. Two attempts to send
  // a login message occur for users that verify while
  // at the /confirm screen. The first attempt is made when
  // /confirm is first displayed, the 2nd when verification
  // completes.
  // if (loginData.uid !== uidOfLoginNotification) {
  //   uidOfLoginNotification = loginData.uid;

  // send web channel LOGIN command with loginData
  // }
}
