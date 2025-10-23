/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import InlineRecoveryKeySetup from '.';
import {
  MOCK_CMS_INFO,
  MOCK_EMAIL,
  MOCK_RECOVERY_KEY_WITH_SPACES,
} from '../mocks';

export const Subject = ({
  currentStep = 1,
  cms = false,
}: {
  currentStep?: number;
  cms?: boolean;
}) => (
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
    formattedRecoveryKey={MOCK_RECOVERY_KEY_WITH_SPACES}
    navigateForward={() => {}}
    cmsInfo={cms ? MOCK_CMS_INFO : undefined}
  />
);
