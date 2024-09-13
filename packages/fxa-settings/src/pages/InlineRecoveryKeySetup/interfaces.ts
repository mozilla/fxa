/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export interface CreateRecoveryKeyHandler {
  localizedErrorMessage?: string;
  data?: {
    recoveryKey: Uint8Array;
  };
}

export interface InlineRecoveryKeySetupProps {
  createRecoveryKeyHandler: () => Promise<CreateRecoveryKeyHandler>;
  updateRecoveryHintHandler: (hint: string) => Promise<void>;
  currentStep: number;
  email: string;
  formattedRecoveryKey: string;
  navigateForward: () => void;
}
