/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { Integration, PairingAuthorityIntegration } from '../../../../models';
import AuthTotp from '../../../Pair/AuthTotp';
import { MozServices } from '../../../../lib/types';
import { navigateWithQuery } from '../../../../lib/utilities';

export type EnterTotpContainerProps = {
  integration?: Integration | PairingAuthorityIntegration;
};

/**
 * The desktop's TOTP prompt for an account with two-step authentication,
 * shown on entry to the flow before any pairing channel exists. A verified
 * code returns to scan_qr with `totpComplete` set so the check is not repeated.
 */
const EnterTotpContainer = ({ integration }: EnterTotpContainerProps) => {
  if (!(integration instanceof PairingAuthorityIntegration)) {
    throw new Error('Invalid integration type.');
  }

  const onVerified = () => {
    navigateWithQuery('/pair/authority/scan_qr', {
      replace: true,
      state: { totpComplete: true },
    });
  };

  return <AuthTotp serviceName={MozServices.FirefoxSync} {...{ onVerified }} />;
};

export default EnterTotpContainer;
