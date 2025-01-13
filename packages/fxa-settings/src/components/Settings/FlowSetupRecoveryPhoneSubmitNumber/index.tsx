/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner from '../../Banner';
import { BackupRecoveryPhoneImage } from '../../images';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useFtlMsgResolver } from '../../../models';
import FormPhoneNumber from '../../FormPhoneNumber';

export type FlowSetupRecoveryPhoneSubmitNumberProps = {
  currentStep?: number;
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  numberOfSteps?: number;
  verifyPhoneNumber: (phoneNumber: string) => Promise<void>;
};

export const FlowSetupRecoveryPhoneSubmitNumber = ({
  currentStep = 1,
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  numberOfSteps = 2,
  verifyPhoneNumber,
}: FlowSetupRecoveryPhoneSubmitNumberProps) => {
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState('');

  const ftlMsgResolver = useFtlMsgResolver();

  const clearBanners = async () => {
    setLocalizedErrorBannerMessage(''); // Clear the banner message
  };

  const handlePhoneNumber = async (phoneNumber: string) => {
    await clearBanners();
    try {
      await verifyPhoneNumber(phoneNumber);
      navigateForward();
      return { hasErrors: false };
    } catch (error) {
      const localizedError = getLocalizedErrorMessage(ftlMsgResolver, error);
      setLocalizedErrorBannerMessage(localizedError);
      return { hasErrors: true };
    }
  };

  return (
    <FlowContainer
      {...{ localizedBackButtonTitle }}
      title={localizedPageTitle}
      onBackButtonClick={navigateBackward}
    >
      <ProgressBar {...{ currentStep, numberOfSteps }} />
      {localizedErrorBannerMessage && (
        <Banner
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
          bannerId="flow-setup-phone-submit-number-error"
        />
      )}
      <BackupRecoveryPhoneImage />
      <FtlMsg id="flow-setup-phone-submit-number-heading">
        <h2 className="font-bold text-xl">Verify your phone number</h2>
      </FtlMsg>
      <FtlMsg id="flow-setup-phone-verify-number-instruction">
        <p className="text-base my-4">
          You’ll get a text message from Mozilla with a code to verify your
          number. Don’t share this code with anyone.
        </p>
      </FtlMsg>
      <FormPhoneNumber
        infoBannerContent={{
          localizedDescription: ftlMsgResolver.getMsg(
            'flow-setup-phone-submit-number-info-message-v2',
            'Recovery phone is only available in the United States and Canada. VoIP numbers and phone masks are not recommended.'
          ),
        }}
        localizedCTAText={ftlMsgResolver.getMsg(
          'flow-setup-phone-submit-number-button',
          'Send code'
        )}
        submitPhoneNumber={handlePhoneNumber}
        errorBannerId="flow-setup-phone-submit-number-error"
      />
      <FtlMsg id="flow-setup-phone-submit-number-legal">
        <p className="text-xs mt-6">
          By providing your number, you agree to us storing it so we can text
          you for account verification only. Message and data rates may apply.
        </p>
      </FtlMsg>
    </FlowContainer>
  );
};

export default FlowSetupRecoveryPhoneSubmitNumber;
