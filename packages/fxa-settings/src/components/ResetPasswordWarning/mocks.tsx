/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { ResetPasswordTokenTypes, tokenType } from 'fxa-auth-client/browser';
import { MOCK_EMAIL, MOCK_HEXSTRING_32, MOCK_UID } from '../../pages/mocks';

export const createMockLocationState = (recoveryKeyExists?: boolean) => {
  return {
    code: MOCK_HEXSTRING_32,
    email: MOCK_EMAIL,
    token: MOCK_HEXSTRING_32,
    kind: tokenType.passwordForgotToken as ResetPasswordTokenTypes,
    uid: MOCK_UID,
    recoveryKeyExists,
  };
};
