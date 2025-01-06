/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { SETTINGS_PATH } from '../../../constants';
import { useFtlMsgResolver } from '../../../models';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import FlowSetupRecoveryPhoneConfirmCode from '../FlowSetupRecoveryPhoneConfirmCode';
import FlowSetupRecoveryPhoneSubmitNumber from '../FlowSetupRecoveryPhoneSubmitNumber';

const numberOfSteps = 2;

type PageRecoveryPhoneSetupProps = {
  testPhoneNumber?: string;
  testStep?: 1 | 2;
};

// temporary props for storybook purposes
export const PageRecoveryPhoneSetup = ({
  testPhoneNumber,
  testStep,
}: PageRecoveryPhoneSetupProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(testStep || 1);
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState<string>(
    testPhoneNumber || ''
  );

  const goHome = () =>
    navigate(SETTINGS_PATH + '#two-step-authentication', { replace: true });

  const localizedPageTitle = ftlMsgResolver.getMsg(
    'page-setup-recovery-phone-title',
    'Add recovery phone'
  );

  const localizedBackButtonTitle = ftlMsgResolver.getMsg(
    'page-setup-recovery-phone-back-button-title',
    'Back to settings'
  );

  const navigateBackward = () => {
    navigate(SETTINGS_PATH);
  };

  const navigateForward = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (currentStep + 1 <= numberOfSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate(SETTINGS_PATH);
    }
  };

  const sendCode = async () => {
    // Placeholder until we have a proper SMS code sender
  };

  const verifyRecoveryCode = async (code: string) => {
    // Placeholder until we have a proper SMS code verifier
  };

  const verifyPhoneNumber = async (phoneNumber: string) => {
    // Placeholder until we have a proper phone number verifier
    // for now let's just make it available for the next step
    await setFormattedPhoneNumber(phoneNumber);
  };

  return (
    <>
      <VerifiedSessionGuard onDismiss={goHome} onError={goHome} />
      {/* Verify and submit phone number */}
      {currentStep === 1 && (
        <FlowSetupRecoveryPhoneSubmitNumber
          {...{
            localizedBackButtonTitle,
            localizedPageTitle,
            navigateBackward,
            navigateForward,
            verifyPhoneNumber,
            currentStep,
            numberOfSteps,
          }}
        />
      )}

      {/* Confirm code received via SMS */}
      {currentStep === 2 && (
        <FlowSetupRecoveryPhoneConfirmCode
          {...{
            formattedPhoneNumber,
            localizedBackButtonTitle,
            localizedPageTitle,
            navigateBackward,
            navigateForward,
            sendCode,
            verifyRecoveryCode,
            currentStep,
            numberOfSteps,
          }}
        />
      )}
    </>
  );
};

export default PageRecoveryPhoneSetup;
