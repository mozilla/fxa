/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface AccountRecoveryConfirmKeyFormData {
  recoveryKey: string;
}

export interface AccountRecoveryConfirmKeyLocationState {
  code: string;
  email: string;
  estimatedSyncDeviceCount: number;
  token: string;
  uid: string;
  accountResetToken?: string;
  emailToHashWith?: string;
  recoveryKeyExists?: boolean;
  recoveryKeyHint?: string;
  totpExists?: boolean;
}

export interface AccountRecoveryConfirmKeyProps
  extends AccountRecoveryConfirmKeyLocationState {
  errorMessage: string;
  recoveryKeyHint?: string;
  isSubmitDisabled: boolean;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setIsSubmitDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  verifyRecoveryKey: (recoveryKey: string) => Promise<void>;
}
