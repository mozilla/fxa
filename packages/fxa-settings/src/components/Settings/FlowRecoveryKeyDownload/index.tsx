/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { logViewEvent } from '../../../lib/metrics';
import RecoveryKeySetupDownload from '../../RecoveryKeySetupDownload';
import { RecoveryKeyImage } from '../../images';
import { FtlMsg } from 'fxa-react/lib/utils';

export type FlowRecoveryKeyDownloadProps = {
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  recoveryKeyValue: string;
  viewName: string;
  email: string;
};

export const FlowRecoveryKeyDownload = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  recoveryKeyValue,
  viewName,
  email,
}: FlowRecoveryKeyDownloadProps) => {
  return (
    <FlowContainer
      title={localizedPageTitle}
      onBackButtonClick={() => {
        navigateBackward();
        logViewEvent(`flow.${viewName}`, 'recovery-key.skip-download');
      }}
      {...{ localizedBackButtonTitle }}
    >
      <div className="w-full flex flex-col">
        <ProgressBar currentStep={3} numberOfSteps={4} />
        <RecoveryKeyImage />

        <FtlMsg id="flow-recovery-key-download-heading-v2">
          <h2 className="font-bold text-xl">
            Account recovery key created — Download and store it now
          </h2>
        </FtlMsg>
        <FtlMsg id="flow-recovery-key-download-info-v2">
          <p className="my-4">
            This key allows you to recover your data if you forget your
            password. Download it now and store it somewhere you’ll remember —
            you won’t be able to return to this page later.
          </p>
        </FtlMsg>
        <RecoveryKeySetupDownload
          {...{ recoveryKeyValue, email, navigateForward, viewName }}
        />
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyDownload;
