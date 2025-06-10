/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { TotpSetupContext, useTotpSetup } from '../useTotpSetup';
import {
  MOCK_2FA_SECRET_KEY_RAW,
  MOCK_BACKUP_CODES,
  PLACEHOLDER_QR_CODE,
} from '../../../pages/mocks';

export const MOCK_TOTP_INFO = {
  qrCodeUrl: PLACEHOLDER_QR_CODE,
  secret: MOCK_2FA_SECRET_KEY_RAW,
  recoveryCodes: MOCK_BACKUP_CODES,
};

export const MockTotpSetupProvider = ({
  children,
  override,
}: {
  children: React.ReactNode;
  override?: Partial<ReturnType<typeof useTotpSetup>>;
}) => {
  return (
    <TotpSetupContext.Provider
      value={{
        totpInfo: MOCK_TOTP_INFO,
        loading: false,
        error: null,
        ...override,
      }}
    >
      {children}
    </TotpSetupContext.Provider>
  );
};
