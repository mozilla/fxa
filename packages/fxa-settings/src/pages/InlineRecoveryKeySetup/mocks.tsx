/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import InlineRecoveryKeySetup from '.';
import { MOCK_EMAIL, MOCK_RECOVERY_KEY } from '../mocks';

export const Subject = ({ currentStep = 1 }: { currentStep?: number }) => (
  <InlineRecoveryKeySetup
    {...{ currentStep }}
    createRecoveryKeyHandler={() =>
      Promise.resolve({
        data: {
          recoveryKey: new Uint8Array(20),
        },
      })
    }
    updateRecoveryHintHandler={() => Promise.resolve()}
    email={MOCK_EMAIL}
    formattedRecoveryKey={MOCK_RECOVERY_KEY}
    navigateForward={() => {}}
  />
);
