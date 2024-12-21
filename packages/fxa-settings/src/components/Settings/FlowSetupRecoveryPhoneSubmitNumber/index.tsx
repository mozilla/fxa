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
  localizedBackButtonTitle: string;
  localizedPageTitle: string;
  navigateBackward: () => void;
  navigateForward: () => void;
  verifyPhoneNumber: (phoneNumber: string) => Promise<void>;
};

export const FlowSetupRecoveryPhoneSubmitNumber = ({
  localizedBackButtonTitle,
  localizedPageTitle,
  navigateBackward,
  navigateForward,
  verifyPhoneNumber,
}: FlowSetupRecoveryPhoneSubmitNumberProps) => {
  const [localizedErrorBannerMessage, setLocalizedErrorBannerMessage] =
    useState('');

  const ftlMsgResolver = useFtlMsgResolver();

  const clearBanners = async () => {
    return new Promise<void>((resolve) => {
      setLocalizedErrorBannerMessage(''); // Clear the banner message
      setTimeout(() => resolve(), 0); // Wait for DOM update
    });
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
      <ProgressBar currentStep={1} numberOfSteps={2} />
      {localizedErrorBannerMessage && (
        <Banner
          ref={(el) => el && el.focus()}
          type="error"
          content={{ localizedHeading: localizedErrorBannerMessage }}
        />
      )}
      <BackupRecoveryPhoneImage />
      <FtlMsg id="flow-setup-phone-submit-number-heading">
        <h2 className="font-bold text-xl">Verify your phone number</h2>
      </FtlMsg>
      <FtlMsg id="flow-setup-phone-verify-number-instruction">
        <p className="text-base my-4">
          You’ll get a text message from Mozilla with a code to verify your
          number. Don't share this code with anyone.
        </p>
      </FtlMsg>

      <FormPhoneNumber
        infoBannerContent={{
          localizedDescription: ftlMsgResolver.getMsg(
            'flow-setup-phone-submit-number-info-message',
            'Backup recovery phone is only available in the United States and Canada. VoIP numbers and phone masks are not recommended.'
          ),
        }}
        infoBannerLink={{
          localizedText: ftlMsgResolver.getMsg(
            'flow-setup-phone-submit-number-info-message-link',
            'Use backup authentication codes instead'
          ),
          // TODO in FXA-10370: Update the link path to the correct one
          path: '#',
        }}
        localizedCTAText={ftlMsgResolver.getMsg(
          'flow-setup-phone-submit-number-button',
          'Send code'
        )}
        submitPhoneNumber={handlePhoneNumber}
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
