/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { FormEvent, useState } from 'react';
import FlowContainer from '../FlowContainer';
import ProgressBar from '../ProgressBar';
import { FtlMsg } from 'fxa-react/lib/utils';
import Banner from '../../Banner';
import { BackupRecoveryPhoneImage } from '../../images';
import { getLocalizedErrorMessage } from '../../../lib/error-utils';
import { useFtlMsgResolver } from '../../../models';
import InputText from '../../InputText';

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
    setLocalizedErrorBannerMessage('');
  };

  const handleSubmit = async (phoneNumber: string) => {
    await clearBanners();
    try {
      await verifyPhoneNumber(phoneNumber);
      navigateForward();
    } catch (error) {
      const localizedError = getLocalizedErrorMessage(ftlMsgResolver, error);
      setLocalizedErrorBannerMessage(localizedError);
    }
    return;
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

      {/* INPUT, INFO MESSAGE AND BUTTON ARE PLACEHOLDERS THAT WILL BE REPLACED BY THE PHONE NUMBER FORM COMPONENT */}
      <form>
        <label htmlFor="phoneNumber">Enter phone number</label>
        <input id="phoneNumber" type="tel" />
        <Banner
          type="info"
          content={{
            localizedDescription:
              'If your country is not supported for this recovery method, you can use backup authentication codes instead.',
          }}
        ></Banner>
        <FtlMsg id="flow-setup-phone-submit-number-button">
          <button type="submit" className="cta-primary cta-xl">
            Send code
          </button>
        </FtlMsg>
      </form>
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
