/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { MOCK_SESSION_TOKEN, MOCK_UID } from '../mocks';

export const MOCK_TOTP_TOKEN = {
  secret: '1234567890',
  qrCodeUrl: 'data:image/png;base64,pewpewpew',
  recoveryCodes: ['recoveryCode1', 'recoveryCode2'],
};
export const MOCK_QUERY_PARAMS = {
  client_id: 'dcdb5ae7add825d2',
  pkce_client_id: '38a6b9b3a65a1871',
  redirect_uri: 'http%3A%2F%2Flocalhost%3A8080%2Fapi%2Foauth',
  scope: 'profile%20openid',
  acr_values: 'AAL2',
};
export const MOCK_EMAIL = 'nomannisanislandexcepttheisleofmann@example.gg';
export const MOCK_SIGNIN_LOCATION_STATE = {
  email: MOCK_EMAIL,
  sessionToken: MOCK_SESSION_TOKEN,
  uid: MOCK_UID,
  verified: true,
};
export const MOCK_SIGNIN_RECOVERY_LOCATION_STATE = {
  ...MOCK_SIGNIN_LOCATION_STATE,
  totp: MOCK_TOTP_TOKEN,
};
