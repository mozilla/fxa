/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import RecoveryKeySetupDownload, { RecoveryKeySetupDownloadProps } from '.';
import { MOCK_ACCOUNT } from '../../models/mocks';
import { MOCK_RECOVERY_KEY_WITH_SPACES } from '../../pages/mocks';
import AppLayout from '../AppLayout';

export const Subject = (props: Partial<RecoveryKeySetupDownloadProps>) => {
  return (
    <AppLayout>
      <RecoveryKeySetupDownload
        recoveryKeyValue={MOCK_RECOVERY_KEY_WITH_SPACES}
        email={MOCK_ACCOUNT.primaryEmail.email}
        navigateForward={() => Promise.resolve()}
        viewName="viewName"
        {...props}
      />
    </AppLayout>
  );
};
