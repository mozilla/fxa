/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
import FormPasswordWithBalloons from '../FormPasswordWithBalloons';
import InputText from '../InputText';
import LinkExternal from 'fxa-react/components/LinkExternal';
import GleanMetrics from '../../lib/glean';
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
  ageCheckErrorText,
  setAgeCheckErrorText,
  onFocusAgeInput,
  onBlurAgeInput,
  submitButtonGleanId
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
        submitButtonGleanId
      }}
      passwordFormType="signup"
    >
      {setAgeCheckErrorText &&
        setAgeCheckErrorText &&
        onFocusAgeInput &&
        onBlurAgeInput && (
          <>
            {/* TODO: original component had a SR-only label that is not straightforward to implement with existing InputText component
SR-only text: "How old are you? To learn why we ask for your age, follow the “why do we ask” link below. */}
            <FtlMsg id="signup-age-check-label" attrs={{ label: true }}>
              <InputText
                name="age"
                label="How old are you?"
                inputMode="numeric"
                className="mb-4"
                pattern="[0-9]*"
                maxLength={3}
                onChange={() => {
                  // clear error tooltip if user types in the field
                  if (ageCheckErrorText) {
                    setAgeCheckErrorText('');
                  }
                }}
                inputRef={register({
                  pattern: /^[0-9]*$/,
                  maxLength: 3,
                  required: true,
                })}
                onFocusCb={onFocusAgeInput}
                onBlurCb={onBlurAgeInput}
                errorText={ageCheckErrorText}
                tooltipPosition="bottom"
                anchorPosition="end"
                prefixDataTestId="age"
              />
            </FtlMsg>
            <FtlMsg id="signup-coppa-check-explanation-link">
              <LinkExternal
                href="https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites"
                className={`link-blue text-sm py-1 -mt-2 self-start ${
                  isDesktopRelay ? 'mb-8' : 'mb-4'
                }`}
                onClick={() => GleanMetrics.registration.whyWeAsk()}
              >
                Why do we ask?
              </LinkExternal>
            </FtlMsg>
          </>
        )}

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
