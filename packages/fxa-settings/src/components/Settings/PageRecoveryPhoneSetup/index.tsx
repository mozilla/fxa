/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import { useNavigateWithQuery } from '../../../lib/hooks/useNavigateWithQuery';
import { SETTINGS_PATH } from '../../../constants';
import { useAccount, useFtlMsgResolver } from '../../../models';
import VerifiedSessionGuard from '../VerifiedSessionGuard';
import FlowSetupRecoveryPhoneConfirmCode from '../FlowSetupRecoveryPhoneConfirmCode';
import FlowSetupRecoveryPhoneSubmitNumber from '../FlowSetupRecoveryPhoneSubmitNumber';
import { RouteComponentProps, useLocation } from '@reach/router';
import { RecoveryPhoneSetupReason } from '../../../lib/types';

const numberOfSteps = 2;

export const PageRecoveryPhoneSetup = (_: RouteComponentProps) => {
  const ftlMsgResolver = useFtlMsgResolver();
  const navigateWithQuery = useNavigateWithQuery();
  const account = useAccount();
  const location = useLocation();
  const reason: RecoveryPhoneSetupReason =
    (location as any)?.state?.reason ?? RecoveryPhoneSetupReason.setup;

  const [phoneData, setPhoneData] = useState<{
    phoneNumber: string;
    nationalFormat: string | undefined;
  }>({
    phoneNumber: '',
    nationalFormat: '',
  });

  const [currentStep, setCurrentStep] = useState<number>(1);

  const goHome = () =>
    navigateWithQuery(SETTINGS_PATH + '#two-step-authentication', {
      replace: true,
    });

  const localizedPageTitle =
    reason === RecoveryPhoneSetupReason.change
      ? ftlMsgResolver.getMsg(
          'page-change-recovery-phone-heading',
          'Change recovery phone'
        )
      : ftlMsgResolver.getMsg(
          'page-setup-recovery-phone-heading',
          'Add recovery phone'
        );

  const localizedBackButtonTitle =
    currentStep === 1
      ? ftlMsgResolver.getMsg(
          'page-setup-recovery-phone-back-button-title',
          'Back to settings'
        )
      : ftlMsgResolver.getMsg(
          'page-setup-recovery-phone-step2-back-button-title',
          'Change phone number'
        );

  const navigateBackward = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigateWithQuery(SETTINGS_PATH);
    }
  };

  const navigateForward = (e?: React.MouseEvent<HTMLElement>) => {
    e?.preventDefault();
    if (currentStep + 1 <= numberOfSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      navigateWithQuery(SETTINGS_PATH);
    }
  };

  const sendCode = async () => {
    // Just retry adding the number and another code will send. Note that more than
    // one code can be valid at the same time if the user clicks “resend code” to
    // account for SMS transmission delay. (This will change in FXA-11039)
    // try/catch is in the component that calls this function
    await account.addRecoveryPhone(phoneData.phoneNumber);
  };

  const verifyRecoveryCode = async (code: string) => {
    // try/catch is in the component that calls this function
    reason === RecoveryPhoneSetupReason.change
      ? await account.changeRecoveryPhone(code)
      : await account.confirmRecoveryPhone(code, phoneData.phoneNumber);
    // get the latest status of recovery phone info
    // ensure correct data is shown on the settings page
    await account.refresh('recoveryPhone');
  };

  const verifyPhoneNumber = async (phoneNumberInput: string) => {
    // try/catch is in the component that calls this function
    const { nationalFormat } = await account.addRecoveryPhone(phoneNumberInput);
    setPhoneData({
      phoneNumber: phoneNumberInput,
      nationalFormat,
    });
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
            reason
          }}
        />
      )}

      {/* Confirm code received via SMS */}
      {currentStep === 2 && (
        <FlowSetupRecoveryPhoneConfirmCode
          // Use phoneNumber as a fallback in case nationalFormat is not available
          nationalFormatPhoneNumber={
            phoneData.nationalFormat || phoneData.phoneNumber
          }
          {...{
            localizedBackButtonTitle,
            localizedPageTitle,
            navigateBackward,
            navigateForward,
            sendCode,
            verifyRecoveryCode,
            currentStep,
            numberOfSteps,
            reason
          }}
        />
      )}
    </>
  );
};

export default PageRecoveryPhoneSetup;
