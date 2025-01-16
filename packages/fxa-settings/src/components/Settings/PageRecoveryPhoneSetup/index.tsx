/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useNavigateWithQuery as useNavigate } from '../../../lib/hooks/useNavigateWithQuery';
import { SETTINGS_PATH } from '../../../constants';
import { useAccount, useFtlMsgResolver } from '../../../models';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import FlowSetupRecoveryPhoneConfirmCode from '../FlowSetupRecoveryPhoneConfirmCode';
import FlowSetupRecoveryPhoneSubmitNumber from '../FlowSetupRecoveryPhoneSubmitNumber';
import { RouteComponentProps } from '@reach/router';

const numberOfSteps = 2;

export const PageRecoveryPhoneSetup = (_: RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigate = useNavigate();
  const account = useAccount();

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  // TODO, actually format this. Should get `national_format` back from Twilio?
  const formattedPhoneNumber = phoneNumber;

  const [currentStep, setCurrentStep] = useState<number>(1);

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
    // Just retry adding the number and another code will send. Note that more than
    // one code can be valid at the same time if the user clicks “resend code” to
    // account for SMS transmission delay. (This will change in FXA-11039)
    // try/catch is in the component that calls this function
    await account.addRecoveryPhone(phoneNumber);
  };

  const verifyRecoveryCode = async (code: string) => {
    // try/catch is in the component that calls this function
    await account.confirmRecoveryPhone(code, phoneNumber);
  };

  const verifyPhoneNumber = async (phoneNumberInput: string) => {
    // try/catch is in the component that calls this function
    await account.addRecoveryPhone(phoneNumberInput);
    setPhoneNumber(phoneNumberInput);
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
