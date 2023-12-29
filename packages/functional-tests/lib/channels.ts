/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export enum FirefoxCommand {
  FxAStatus = 'fxaccounts:fxa_status',
  OAuthLogin = 'fxaccounts:oauth_login',
  Logout = 'fxaccounts:logout',
  Login = 'fxaccounts:login',
  LinkAccount = 'fxaccounts:can_link_account',
  ChangePassword = 'fxaccounts:change_password',
}

export type CustomEventDetail = ReturnType<typeof createCustomEventDetail>;

export function createCustomEventDetail(
  command: FirefoxCommand,
  data: Record<string, any>
) {
  return {
    id: 'account_updates',
    message: {
      command,
      data,
    },
  };
}
