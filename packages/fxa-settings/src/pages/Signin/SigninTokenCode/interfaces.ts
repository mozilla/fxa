/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import VerificationReasons from '../../../constants/verification-reasons';
import { AccountTotp } from '../../../lib/interfaces';
import { Integration } from '../../../models';

export type SigninTokenCodeIntegration = Pick<Integration, 'type' | 'isSync'>;

export interface SigninTokenCodeProps {
  email: string;
  integration: SigninTokenCodeIntegration;
  verificationReason?: VerificationReasons;
}

export interface TotpResponse {
  account: {
    totp: AccountTotp;
  };
}

export interface SigninLocationState {
  email?: string;
  verificationReason?: VerificationReasons;
}
