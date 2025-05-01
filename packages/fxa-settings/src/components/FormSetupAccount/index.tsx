/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import FormPasswordWithBalloons from '../FormPasswordWithBalloons';
import ChooseNewsletters from '../ChooseNewsletters';
import ChooseWhatToSync from '../ChooseWhatToSync';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FormSetupAccountProps } from './interfaces';
import { newsletters } from '../ChooseNewsletters/newsletters';

export const FormSetupAccount = ({
  formState,
  errors,
  trigger,
  register,
  getValues,
  onFocus,
  email,
  onFocusMetricsEvent,
  onSubmit,
  loading,
  isSync,
  offeredSyncEngineConfigs,
  setDeclinedSyncEngines,
  isDesktopRelay,
  setSelectedNewsletterSlugs,
  submitButtonGleanId,
}: FormSetupAccountProps) => {
  const showCWTS = () => {
    if (isSync) {
      if (offeredSyncEngineConfigs) {
        return (
          <ChooseWhatToSync
            {...{
              offeredSyncEngineConfigs,
              setDeclinedSyncEngines,
            }}
          />
        );
      } else {
        // Waiting to receive webchannel message from browser
        return <LoadingSpinner className="flex justify-center mb-4" />;
      }
    } else {
      // Display nothing if Sync flow that does not support webchannels
      // or if CWTS is disabled
      return <></>;
    }
  };

  return (
    <FormPasswordWithBalloons
      {...{
        formState,
        errors,
        trigger,
        register,
        getValues,
        email,
        onFocusMetricsEvent,
        disableButtonUntilValid: true,
        onSubmit,
        loading,
        submitButtonGleanId,
      }}
      passwordFormType="signup"
      requirePasswordConfirmation={isSync}
    >
      {isSync
        ? showCWTS()
        : !isDesktopRelay &&
          setSelectedNewsletterSlugs && (
            <ChooseNewsletters
              {...{
                newsletters,
                setSelectedNewsletterSlugs,
              }}
            />
          )}
    </FormPasswordWithBalloons>
  );
};
