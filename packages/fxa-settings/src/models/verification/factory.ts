/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { useContext } from 'react';
import { VerificationInfo } from './verification-info';
import { AppContext } from '../AppContext';
import { AccountRecoveryKeyInfo } from './account-recovery-key-info';

export function CreateVerificationInfo() {
  const { urlQueryData } = useContext(AppContext);

  if (urlQueryData == null) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  return new VerificationInfo(urlQueryData);
}

export function CreateAccountRecoveryKeyInfo() {
  const { locationStateData } = useContext(AppContext);

  if (locationStateData == null) {
    throw new Error('Are you forgetting an AppContext.Provider?');
  }

  return new AccountRecoveryKeyInfo(locationStateData);
}
