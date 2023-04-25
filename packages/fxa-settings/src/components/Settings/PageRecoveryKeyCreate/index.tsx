/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps, useNavigate } from '@reach/router';
import { useFtlMsgResolver } from '../../../models';
import { usePageViewEvent } from '../../../lib/metrics';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import { HomePath } from '../../../constants';
import FlowRecoveryKeyInfo from '../FlowRecoveryKeyInfo';

export const PageRecoveryKeyCreate = (props: RouteComponentProps) => {
  const navigate = useNavigate();
  const ftlMsgResolver = useFtlMsgResolver();
  const goHome = () => navigate(HomePath + '#recovery-key', { replace: true });
  const [currentStep, setCurrentStep] = useState(1);
  usePageViewEvent('settings.account-recovery');
  const localizedPageTitle = ftlMsgResolver.getMsg(
    'recovery-key-create-page-title',
    'Account Recovery Key'
  );

  /*
    The content here will obviously be replaced as we complete the separate views for this flow. This page will use the same pattern as the example wizard in storybook for `FlowContainer`. All steps will be separate components which use the `FlowContainer` and accept `currentStep` and `setCurrentStep` as the props necessary to move the user through the flow.
  */
  return (
    <>
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      {
        // Create an account recovery key
        currentStep === 1 && (
          <FlowRecoveryKeyInfo
            {...{ localizedPageTitle }}
            navigateForward={() => {
              setCurrentStep(2);
            }}
            navigateBackward={() => {
              navigate('/settings');
            }}
          />
        )
      }
      {
        // Enter your password again to get started
        currentStep === 2 && <p>second step</p>
      }
    </>
  );
};

export default PageRecoveryKeyCreate;
