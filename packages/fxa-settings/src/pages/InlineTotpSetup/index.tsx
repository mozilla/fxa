/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useFtlMsgResolver } from '../../models';
import AppLayout from '../../components/AppLayout';
import { InlineTotpSetupProps } from './interfaces';
import FlowSetup2faPrompt from '../../components/Settings/FlowSetup2faPrompt';
import FlowSetup2faApp from '../../components/Settings/FlowSetup2faApp';

// Total number of steps in the TOTP setup flow, including the recovery method setup.
const numberOfSteps = 4;

export const InlineTotpSetup = ({
  totp,
  serviceName,
  verifyCodeHandler,
  integration,
}: InlineTotpSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const [currentStep, setCurrentStep] = useState<number>(0);

  const onSubmit = async (code: string) => {
    try {
      await verifyCodeHandler(code);
    } catch (err) {
      return { error: true };
    }
    return { error: false };
  };

  const navigateBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'inline-totp-setup-page-title',
    'Two-step authentication'
  );

  const cmsInfo = integration?.getCmsInfo?.();

  return (
    <AppLayout wrapInCard={false} cmsInfo={cmsInfo}>
      {currentStep === 0 && (
        <FlowSetup2faPrompt
          onContinue={() => setCurrentStep(currentStep + 1)}
          localizedPageTitle={localizedPageTitle}
          serviceName={serviceName}
          cmsInfo={cmsInfo}
        />
      )}
      {currentStep === 1 && (
        <FlowSetup2faApp
          localizedPageTitle={localizedPageTitle}
          showProgressBar
          currentStep={currentStep}
          numberOfSteps={numberOfSteps}
          totpInfo={totp}
          verifyCode={onSubmit}
          onBackButtonClick={navigateBackward}
          cmsInfo={cmsInfo}
        />
      )}
    </AppLayout>
  );
};

export default InlineTotpSetup;
