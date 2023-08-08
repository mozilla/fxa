/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import {
  isOAuthIntegration,
  isSyncDesktopIntegration,
  useFtlMsgResolver,
} from '../../models';
import { logViewEvent, usePageViewEvent } from '../../lib/metrics';
import { MozServices } from '../../lib/types';
import { FtlMsg, hardNavigateToContentServer } from 'fxa-react/lib/utils';
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
import AppLayout from '../../components/AppLayout';
import { SignupFormData, SignupProps } from './interfaces';
import { sessionToken } from '../../lib/cache';
import { notifyFirefoxOfLogin } from '../../lib/channels/helpers';

export const viewName = 'signup';

const Signup = ({
  integration,
  queryParams,
  beginSignupHandler,
}: SignupProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [serviceName, setServiceName] = useState<string>(MozServices.Default);
  useEffect(() => {
    (async () => {
      setServiceName(await integration.getServiceName());
    })();
  });

  const canChangeEmail = !isOAuthIntegration(integration);

  const onFocusMetricsEvent = `${viewName}.engage`;
  // TODO, see if this is how we want to check for Pocket
  const isPocketClient = serviceName.includes(MozServices.Pocket);

  const [beginSignupLoading, setBeginSignupLoading] = useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');

  const [ageCheckErrorText, setAgeCheckErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [
    isAccountSuggestionBannerVisible,
    setIsAccountSuggestionBannerVisible,
  ] = useState<boolean>(isPocketClient);
  const navigate = useNavigate();
  const location = useLocation();

  // prefill selected sync engines based on defaultChecked state
  const initialSyncEnginesList: string[] = engines
    .filter((engine) => engine.defaultChecked)
    .map((engine) => engine.text);
  const [selectedEngines, setSelectedEngines] = useState<string[]>(
    initialSyncEnginesList
  );

  // no newsletters are selected by default
  const [selectedNewsletterSlugs, setSelectedNewsletterSlugs] = useState<
    string[]
  >([]);

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<SignupFormData>({
      mode: 'onBlur',
      criteriaMode: 'all',
      defaultValues: {
        email: queryParams.email,
        password: '',
        confirmPassword: '',
        age: '',
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

  const onBlurAgeInput = () => {
    getValues().age === '' && setAgeCheckErrorText(localizedAgeIsRequiredError);
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
  const onSubmit = useCallback(
    async ({ password, age }: SignupFormData) => {
      if (Number(age) < 13) {
        // this is a session cookie. It will go away once:
        // 1. the user closes the tab
        // and
        // 2. the user closes the browser
        // Both of these have to happen or else the cookie
        // hangs around like a bad smell.

        // TODO: probably a better way to set this?
        window.document.cookie = 'tooyoung=1;';
        navigate('/cannot_create_account');
        return;
      }
      setBeginSignupLoading(true);

      const options =
        serviceName !== MozServices.Default ? { service: serviceName } : {};
      const { data, error } = await beginSignupHandler(
        queryParams.email,
        password,
        options
      );

      setBeginSignupLoading(false);

      if (data) {
        sessionToken(data.SignUp.sessionToken);

        // TODO: send up selected sync engines
        if (isSyncDesktopIntegration(integration)) {
          notifyFirefoxOfLogin({
            authAt: data.SignUp.authAt,
            email: queryParams.email,
            keyFetchToken: data.SignUp.keyFetchToken,
            sessionToken: data.SignUp.sessionToken,
            uid: data.SignUp.uid,
            unwrapBKey: data.unwrapBKey,
            verified: false,
          });
        }

        navigate(`/confirm_signup_code${location.search}`, {
          state: {
            email: queryParams.email,
            selectedNewsletterSlugs,
            keyFetchToken: data.SignUp.keyFetchToken,
            unwrapBKey: data.unwrapBKey,
          },
        });
      }
      if (error) {
        const { message, ftlId } = error;
        setBannerErrorText(ftlMsgResolver.getMsg(ftlId, message));
      }
    },
    [
      beginSignupHandler,
      ftlMsgResolver,
      navigate,
      selectedNewsletterSlugs,
      serviceName,
      queryParams.email,
      location.search,
      integration,
    ]
  );

  return (
    // TODO: if force_auth && AuthErrors.is(error, 'DELETED_ACCOUNT') :
    //       - forceMessage('Account no longer exists. Recreate it?')
    <AppLayout>
      <CardHeader
        headingText="Set your password"
        headingTextFtlId="signup-heading"
      />

      {bannerErrorText && (
        <Banner type={BannerType.error}>
          <p>{bannerErrorText}</p>
        </Banner>
      )}

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
        <p className="break-all">{queryParams.email}</p>

        {canChangeEmail && (
          <FtlMsg id="signup-change-email-link">
            {/* TODO: Replace this with `Link` once index page is Reactified */}
            <a
              href="/"
              className="link-blue text-sm"
              onClick={(e) => {
                e.preventDefault();
                // TODO: this takes users to /signin if they've got an email in
                // localStorage. Hopefully there's another workaround but might
                // need to send a param back over to content-server?
                hardNavigateToContentServer('/');
              }}
            >
              Change email
            </a>
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
          email: queryParams.email,
          onFocusMetricsEvent,
        }}
        passwordFormType="signup"
        onSubmit={handleSubmit(onSubmit)}
        loading={beginSignupLoading}
      >
        {/* TODO: original component had a SR-only label that is not straightforward to implement with exisiting InputText component
        SR-only text: "How old are you? To learn why we ask for your age, follow the “why do we ask” link below. */}
        <FtlMsg id="signup-age-check-label" attrs={{ label: true }}>
          <InputText
            name="age"
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
            inputRef={register({
              pattern: /^[0-9]*$/,
              maxLength: 3,
              required: true,
            })}
            onBlurCb={onBlurAgeInput}
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

        {/* TODO: Update offered engines based on received webchannel message */}
        {isSyncDesktopIntegration(integration) ? (
          <ChooseWhatToSync
            {...{ engines, selectedEngines, setSelectedEngines }}
          />
        ) : (
          <ChooseNewsletters
            {...{
              newsletters,
              setSelectedNewsletterSlugs,
            }}
          />
        )}
      </FormPasswordWithBalloons>

      <TermsPrivacyAgreement {...{ isPocketClient }} />
    </AppLayout>
  );
};

export default Signup;
