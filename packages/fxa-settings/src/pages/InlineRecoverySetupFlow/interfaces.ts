/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Dispatch, SetStateAction } from 'react';
import { Choice } from '../../components/FormChoice';
import { MozServices } from '../../lib/types';
import { SigninLocationState, TotpToken } from './../Signin/interfaces';

export type SigninRecoveryLocationState = SigninLocationState & {
  totp: TotpToken;
};

export interface InlineRecoverySetupFlowProps {
  flowHasPhoneChoice: boolean;
  serviceName: MozServices;
  email: string;
  currentStep: number;
  backupMethod: Choice | null;
  backupCodes: string[];
  phoneData: {
    phoneNumber: string;
    nationalFormat: string | undefined;
  };
  navigateForward: () => void;
  navigateBackward: () => void;
  backupChoiceCb: (c: Choice) => Promise<void>;

  backupCodeError: string;
  setBackupCodeError: Dispatch<SetStateAction<string>>;
  sendSmsCode: () => Promise<void>;
  verifyPhoneNumber: (n: string) => Promise<void>;
  verifySmsCode: (c: string) => Promise<void>;
  completeBackupCodeSetup: (c: string) => Promise<void>;
  successfulSetupHandler: () => void;
}
