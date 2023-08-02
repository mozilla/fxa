/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useState } from 'react';
import { Link, RouteComponentProps } from '@reach/router';
import { useForm } from 'react-hook-form';
import { useFtlMsgResolver } from '../../models';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { FtlMsg } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormPasswordWithBalloons from '../../components/FormPasswordWithBalloons';
import InputText from '../../components/InputText';
import ChooseWhatToSync from '../../components/ChooseWhatToSync';
import { engines } from '../../components/ChooseWhatToSync/sync-engines';
import ChooseNewsletters from '../../components/ChooseNewsletters';
import { newsletters } from '../../components/ChooseNewsletters/newsletters';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import Banner, { BannerType } from '../../components/Banner';
import CardHeader from '../../components/CardHeader';
import { REACT_ENTRYPOINT } from '../../constants';

interface SharedProps {
  email: string;
  // canChangeEmail is true if not from relying party or force_auth
  canChangeEmail?: boolean;
  serviceName?: MozServices;
}

// CWTS is enabled if relier is sync or multiService, broker is OAuth
// CWTS and newsletters cannot both be enabled
type ConditionalProps =
  | {
      isCWTSEnabled?: boolean;
      areNewslettersEnabled?: never;
    }
  | {
      isCWTSEnabled?: never;
      areNewslettersEnabled?: boolean;
    }
  | {
      isCWTSEnabled?: never;
      areNewslettersEnabled?: never;
    };

export type SignupProps = SharedProps & ConditionalProps;

type FormData = {
  newPassword: string;
  confirmPassword: string;
  userAge: string;
};

export const viewName = 'signup';

const Signup = ({
  email,
  canChangeEmail = true,
  serviceName,
  isCWTSEnabled,
  areNewslettersEnabled,
}: SignupProps & RouteComponentProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const onFocusMetricsEvent = `${viewName}.engage`;
  const isPocketClient = serviceName === MozServices.Pocket;

  const [ageCheckErrorText, setAgeCheckErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [
    isAccountSuggestionBannerVisible,
    setIsAccountSuggestionBannerVisible,
  ] = useState<boolean>(isPocketClient);

  // prefill selected sync engines based on defaultChecked state
  const initialSyncEnginesList: string[] = engines
    .filter((engine) => engine.defaultChecked)
    .map((engine) => engine.text);
  const [selectedEngines, setSelectedEngines] = useState<string[]>(
    initialSyncEnginesList
  );

  // no newsletters are selected by default
  const [selectedNewsletters, setSelectedNewsletters] = useState<string[]>([]);

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<FormData>({
      mode: 'onBlur',
      criteriaMode: 'all',
      defaultValues: {
        newPassword: '',
        confirmPassword: '',
        userAge: '',
      },
    });

  const ftlMsgResolver = useFtlMsgResolver();

  const localizedAgeIsRequiredError = ftlMsgResolver.getMsg(
    'signup-age-check-input-error',
    'You must enter your age to sign up'
  );

  const onFocus = () => {
    if (!isFocused) {
      logViewEvent('flow', onFocusMetricsEvent, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  // TODO : only show tooltip on attempted submission
  const onBlurAgeInput = () => {
    getValues().userAge === '' &&
      setAgeCheckErrorText(localizedAgeIsRequiredError);
  };

  /**
   * TODO: form submission logic in FXA-6480
   *       - input tooltips on failed form validation:
   *           - 'Valid password required', 'Passwords do not match', 'You must enter your age to sign up'
   *       - metrics events:
   *           - flow.signup.submit/signup.submit
   *           - flwo.signup.attempt
   *           - flow.signup.success/signup.success/signup.signup.success (?)
   *       - age (COPPA) check (age>12). If COPPA fail:
   *           - mark the user as too young
   *           - navigate to a page informing the user
   *             they are unable to sign up.
   *       - newsletter opt-in
   *       - account signup - set password
   *       - handle errors
   **/
  const onSubmit = useCallback(async ({ newPassword, userAge }: FormData) => {
    try {
      // await something
      // go somwehere, pass email as location state
    } catch (e) {
      // do something with the error
    }
  }, []);

  return (
    // TODO: if force_auth && AuthErrors.is(error, 'DELETED_ACCOUNT') :
    //       - forceMessage('Account no longer exists. Recreate it?')
    <>
      <CardHeader
        headingText="Set your password"
        headingTextFtlId="signup-heading"
      />

      {/* AccountSuggestion is only shown to Pocket clients */}
      {isAccountSuggestionBannerVisible && (
        <Banner
          type={BannerType.info}
          dismissible
          setIsVisible={setIsAccountSuggestionBannerVisible}
        >
          <FtlMsg
            id="signup-info-banner-for-pocket"
            elems={{
              linkExternal: (
                <LinkExternal
                  href="https://support.mozilla.org/kb/pocket-firefox-account-migration"
                  className="underline"
                >
                  Find out here
                </LinkExternal>
              ),
            }}
          >
            <p>
              Why do I need to create this account?{' '}
              <LinkExternal
                href="https://support.mozilla.org/kb/pocket-firefox-account-migration"
                className="underline"
              >
                Find out here
              </LinkExternal>
            </p>
          </FtlMsg>
        </Banner>
      )}

      <div className="mt-4 mb-6">
        <p className="break-all">{email}</p>

        {canChangeEmail && (
          <FtlMsg id="signup-change-email-link">
            <Link to="/" className="link-blue text-sm">
              Change email
            </Link>
          </FtlMsg>
        )}
      </div>

      <FormPasswordWithBalloons
        {...{
          formState,
          errors,
          trigger,
          register,
          getValues,
          onFocus,
          email,
          onFocusMetricsEvent,
        }}
        passwordFormType="signup"
        onSubmit={handleSubmit(onSubmit)}
        loading={false}
      >
        {/* TODO: original component had a SR-only label that is not straightforward to implement with exisiting InputText component
        SR-only text: "How old are you? To learn why we ask for your age, follow the “why do we ask” link below. */}
        <FtlMsg id="signup-age-check-label" attrs={{ label: true }}>
          <InputText
            name="userAge"
            label="How old are you?"
            inputMode="numeric"
            className="text-start mb-4"
            pattern="[0-9]*"
            maxLength={3}
            onChange={() => {
              // clear error tooltip if user types in the field
              if (ageCheckErrorText) {
                setAgeCheckErrorText('');
              }
            }}
            onBlurCb={() => onBlurAgeInput()}
            inputRef={register({
              required: true,
            })}
            errorText={ageCheckErrorText}
            tooltipPosition="bottom"
            anchorPosition="start"
          />
        </FtlMsg>
        <FtlMsg id="signup-coppa-check-explanation-link">
          <LinkExternal
            href="https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites"
            className="link-blue text-start text-sm mb-8"
          >
            Why do we ask?
          </LinkExternal>
        </FtlMsg>

        {isCWTSEnabled && (
          <ChooseWhatToSync
            {...{ engines, selectedEngines, setSelectedEngines }}
          />
        )}

        {areNewslettersEnabled && (
          <ChooseNewsletters
            {...{ newsletters, selectedNewsletters, setSelectedNewsletters }}
          />
        )}
      </FormPasswordWithBalloons>

      {isPocketClient ? (
        <TermsPrivacyAgreement isPocketClient />
      ) : (
        <TermsPrivacyAgreement />
      )}
    </>
  );
};

export default Signup;
