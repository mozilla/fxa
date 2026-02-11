/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect } from 'react';
import { FlowContainer } from '../FlowContainer';
import { ProgressBar } from '../ProgressBar';
import { useFtlMsgResolver, useAccount, useAlertBar } from '../../../models';
import { logViewEvent } from '../../../lib/metrics';
import RecoveryKeySetupHint from '../../RecoveryKeySetupHint';

export type FlowRecoveryKeyHintProps = {
  navigateForward: () => void;
  navigateBackward: () => void;
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  viewName: string;
};

export const FlowRecoveryKeyHint = ({
  navigateForward,
  navigateBackward,
  localizedBackButtonTitle,
  localizedPageTitle,
  viewName,
}: FlowRecoveryKeyHintProps) => {
  const account = useAccount();
  const alertBar = useAlertBar();
  const ftlMsgResolver = useFtlMsgResolver();

  useEffect(() => {
    logViewEvent(`flow.${viewName}`, 'create-hint.view');
  }, [viewName]);

  const navigateForwardAndAlertSuccess = () => {
    navigateForward();
    alertBar.success(
      ftlMsgResolver.getMsg(
        'flow-recovery-key-success-alert',
        'Account recovery key created'
      )
    );
  };

  const updateRecoveryKeyHint = async (hint: string) => {
    // The try/catch for this is in RecoveryKeySetupHint. This
    // is just a wrapper because sending in `account.updateRecoveryKeyHint`
    // for this handler didn't have context for "this" from Account.ts
    account.updateRecoveryKeyHint(hint);
  };

  return (
    <FlowContainer
      title={localizedPageTitle}
      localizedBackButtonTitle={localizedBackButtonTitle}
      onBackButtonClick={() => {
        logViewEvent(`flow.${viewName}`, 'create-hint.skip');
        navigateBackward();
      }}
    >
      <div className="w-full flex flex-col">
        <ProgressBar currentStep={4} numberOfSteps={4} />
        <RecoveryKeySetupHint
          {...{ updateRecoveryKeyHint }}
          navigateForward={navigateForwardAndAlertSuccess}
          {...{ viewName }}
        />
      </div>
    </FlowContainer>
  );
};

export default FlowRecoveryKeyHint;
