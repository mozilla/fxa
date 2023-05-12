/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { HomePath } from '../../../constants';
import { usePageViewEvent } from '../../../lib/metrics';
import { useAccount, useFtlMsgResolver } from '../../../models';
import FlowRecoveryKeyConfirmPwd from '../FlowRecoveryKeyConfirmPwd';
import FlowRecoveryKeyDownload from '../FlowRecoveryKeyDownload';
import FlowRecoveryKeyInfo from '../FlowRecoveryKeyInfo';
import VerifiedSessionGuard from '../VerifiedSessionGuard';

const viewName = 'settings.account-recovery';
const numberOfSteps = 4;

export const PageRecoveryKeyCreate = (props: RouteComponentProps) => {
  usePageViewEvent(viewName);

  const account = useAccount();
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formattedRecoveryKey, setFormattedRecoveryKey] = useState<string>('');

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
    navigate('/settings');
  };

  const navigateForward = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (currentStep + 1 <= numberOfSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/settings');
    }
  };

  // Redirects to settings if a recovery key is already set
  // TODO in FXA-7239 - review where user should be redirected if they already have a key created
  // handle issue where user might get bounced out of the flow if the page is refreshed
  useEffect(() => {
    if (account.recoveryKey && !formattedRecoveryKey) {
      navigate(HomePath, { replace: true });
    }
  }, [account, formattedRecoveryKey, navigate]);

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
      {currentStep === 1 && <FlowRecoveryKeyInfo {...{ ...sharedStepProps }} />}

      {/* Confirm password and generate recovery key */}
      {currentStep === 2 && (
        <>
          <FlowRecoveryKeyConfirmPwd
            {...{
              ...sharedStepProps,
              setFormattedRecoveryKey,
            }}
          />
        </>
      )}

      {/* Download recovery key */}
      {currentStep === 3 && (
        <FlowRecoveryKeyDownload
          {...{ ...sharedStepProps }}
          recoveryKeyValue={formattedRecoveryKey}
        />
      )}

      {/* Set a storage hint if the a recovery key exists */}
      {/* TODO add view in FXA-7238 */}
      {currentStep === 4 && (
        <>
          <h1>Fourth step</h1>
          <button
            className="cta-primary cta-base-p mx-2 flex-1"
            type="button"
            onClick={navigateForward}
          >
            click to move to next view
          </button>
        </>
      )}
    </>
  );
};

export default PageRecoveryKeyCreate;
