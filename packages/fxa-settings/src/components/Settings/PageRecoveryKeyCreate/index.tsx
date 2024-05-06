/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { HomePath } from '../../../constants';
import { usePageViewEvent } from '../../../lib/metrics';
import { useAccount, useFtlMsgResolver } from '../../../models';
import FlowRecoveryKeyConfirmPwd from '../FlowRecoveryKeyConfirmPwd';
import FlowRecoveryKeyDownload from '../FlowRecoveryKeyDownload';
import FlowRecoveryKeyInfo from '../FlowRecoveryKeyInfo';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import FlowRecoveryKeyHint from '../FlowRecoveryKeyHint';

export const viewName = 'settings.account-recovery';
const numberOfSteps = 4;

export enum RecoveryKeyAction {
  Create,
  Change,
}

export const PageRecoveryKeyCreate = (props: RouteComponentProps) => {
  usePageViewEvent(viewName);

  const { recoveryKey, email } = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>('');

  const action = recoveryKey
    ? RecoveryKeyAction.Change
    : RecoveryKeyAction.Create;
  const goHome = () => navigate(HomePath + '#recovery-key', { replace: true });

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-page-title',
    'Account Recovery Key'
  );

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-back-button-title',
    'Back to settings'
  );

  const navigateBackward = () => {
    navigate(HomePath);
  };

  const navigateForward = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (currentStep + 1 <= numberOfSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate(HomePath);
    }
  };

  // TODO prevent page refresh? currently refreshing breaks user from flow

  const sharedStepProps = {
    localizedBackButtonTitle,
    localizedPageTitle,
    navigateBackward,
    navigateForward,
    viewName,
  };

  return (
    <>
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      {/* Switch through the account recovery key steps based on step number */}
      {/* Create an account recovery key */}
      {currentStep === 1 && (
        <FlowRecoveryKeyInfo {...{ action, ...sharedStepProps }} />
      )}

      {/* Confirm password and create recovery key */}
      {currentStep === 2 && (
        <FlowRecoveryKeyConfirmPwd
          {...{
            ...sharedStepProps,
            action,
            setFormattedRecoveryKey,
          }}
        />
      )}

      {/* Download recovery key */}
      {currentStep === 3 && (
        <FlowRecoveryKeyDownload
          {...{ ...sharedStepProps, email }}
          recoveryKeyValue={formattedRecoveryKey}
        />
      )}

      {/* Set a storage hint if the a recovery key exists */}
      {currentStep === 4 && <FlowRecoveryKeyHint {...{ ...sharedStepProps }} />}
    </>
  );
};

export default PageRecoveryKeyCreate;
