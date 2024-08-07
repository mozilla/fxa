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

export const FF_OAUTH_CLIENT_ID = '5882386c6d801776';

export type FxaStatusRequest = {};
export type OAuthLoginRequest = {};
export type LogoutRequest = {};
export type LoginRequest = {};
export type LinkAccountRequest = {};
export type ChangePasswordRequest = {};

export type FirefoxCommandRequest =
  | FxaStatusRequest
  | OAuthLoginRequest
  | LogoutRequest
  | LoginRequest
  | LinkAccountRequest
  | ChangePasswordRequest;

export type FxAStatusResponse = {
  id: 'account_updates';
  message: {
    command: FirefoxCommand.FxAStatus;
    data: {
      signedInUser: null | {
        email?: string;
        sessionToken?: string;
        uid?: string;
        verified?: boolean;
      };
      clientId: string;
      capabilities: {
        multiService: boolean;
        pairing: boolean;
        choose_what_to_sync?: boolean;
        engines: string[];
      };
    };
  };
};

export type LinkAccountResponse = {
  id: 'account_updates';
  message: {
    command: FirefoxCommand.LinkAccount;
    data: {
      ok: boolean;
    };
  };
};

export type FirefoxCommandResponse = LinkAccountResponse | FxAStatusResponse;
export const FirefoxCommandsWithResponses = [
  FirefoxCommand.LinkAccount,
  FirefoxCommand.FxAStatus,
];
