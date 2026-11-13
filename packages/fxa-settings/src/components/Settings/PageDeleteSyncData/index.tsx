/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { SETTINGS_PATH } from '../../../constants';
import { useNavigateWithQuery } from '../../../lib/hooks';
import { MfaReason } from '../../../lib/types';
import { AttachedClient, useAccount, useFtlMsgResolver } from '../../../models';
import { MfaGuard } from '../MfaGuard';
import FlowDeleteSyncDataConfirmPwd from '../FlowDeleteSyncDataConfirmPwd';
import FlowDeleteSyncDataDevices, {
  SyncDevice,
} from '../FlowDeleteSyncDataDevices';
import { getSyncDevices } from './utils';

export const MfaGuardPageDeleteSyncData = () => (
  <MfaGuard requiredScope="sync_data" reason={MfaReason.deleteSyncData}>
    <PageDeleteSyncData />
  </MfaGuard>
);

export type PageDeleteSyncDataProps = {
  /** Defaults to the account's sync-capable attached clients. */
  syncCapableDevices?: SyncDevice[];
  /** Lets a story start on the device step. */
  initialStep?: 1 | 2;
  /** Receives every client in the rows the user chose to sign out. */
  onConfirm?: (signOutClients: AttachedClient[]) => void;
};

export const PageDeleteSyncData = ({
  syncCapableDevices,
  initialStep = 1,
  onConfirm = () => {},
}: PageDeleteSyncDataProps) => {
  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const [currentStep, setCurrentStep] = useState<1 | 2>(initialStep);

  const devices = syncCapableDevices ?? getSyncDevices(account.attachedClients);

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'delete-sync-data-page-title',
    'Delete synced data'
  );
  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'delete-sync-data-back-button-title',
    'Back to settings'
  );

  const goHome = () =>
    navigateWithQuery(`${SETTINGS_PATH}#data-collection`, { replace: true });

  const sharedStepProps = {
    localizedBackButtonTitle,
    localizedPageTitle,
  };

  return currentStep === 1 ? (
    <FlowDeleteSyncDataConfirmPwd
      {...sharedStepProps}
      navigateBackward={goHome}
      navigateForward={() => setCurrentStep(2)}
    />
  ) : (
    <FlowDeleteSyncDataDevices
      {...sharedStepProps}
      {...{ devices }}
      navigateBackward={() => setCurrentStep(1)}
      onCancel={goHome}
      {...{ onConfirm }}
    />
  );
};

export default PageDeleteSyncData;
