/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import { usePageViewEvent } from '../../../lib/metrics';
import RecoveryKeyAddWizardViewOne from '../RecoveryKeyAddWizardViewOne';

export const PageRecoveryKeyCreate = (props: RouteComponentProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  usePageViewEvent('settings.account-recovery');

  /*
    The content here will obviously be replaced as we complete the separate views for this flow. This page will use the same pattern as the example wizard in storybook for `FlowContainer`. All steps will be separate components which use the `FlowContainer` and accept `currentStep` and `setCurrentStep` as the props necessary to move the user through the flow.
  */
  return (
    <>
      {
        // Create an account recovery key
        currentStep === 1 && (
          <RecoveryKeyAddWizardViewOne
            navigateForward={() => {
              setCurrentStep(2);
            }}
            navigateBackward={() => {
              window.history.back();
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
