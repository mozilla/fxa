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
import { notifyFirefoxOfLogin } from '../../lib/channels/helpers';
import {
  StoredAccountData,
  persistAccount,
  setCurrentAccount,
} from '../../lib/storage-utils';
import { sessionToken } from '../../lib/cache';
import GleanMetrics from '../../lib/glean';
import { BrandMessagingPortal } from '../../components/BrandMessaging';

export const viewName = 'signup';

// TODO, confirm this is how we want to check for Pocket
// There's a similar TODO in CardHeader. FXA-8290
const isPocketClient = (serviceName: string) =>
  serviceName.includes(MozServices.Pocket);

const Signup = ({
  integration,
  queryParamModel,
  beginSignupHandler,
}: SignupProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  const [serviceName, setServiceName] = useState<string>(MozServices.Default);
  useEffect(() => {
    (async () => {
      // TODO: remove async requirements from relier, FXA-6836. This causes some
      // unnecessary rerenders with banner state (`useReducer` does not help)
      const serviceName = await integration.getServiceName();
      setServiceName(serviceName);
      setIsAccountSuggestionBannerVisible(isPocketClient(serviceName));
    })();
  });

  useEffect(() => {
    GleanMetrics.registration.view();
  }, []);

  const canChangeEmail = !isOAuthIntegration(integration);

  const onFocusMetricsEvent = `${viewName}.engage`;

  const [beginSignupLoading, setBeginSignupLoading] = useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');

  const [ageCheckErrorText, setAgeCheckErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [
    isAccountSuggestionBannerVisible,
    setIsAccountSuggestionBannerVisible,
  ] = useState<boolean>(false);
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
        email: queryParamModel.email,
        newPassword: '',
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

  // TODO: Add metrics events to match parity with content-server in FXA-8302
  // The legacy amplitude events will eventually be replaced by Glean,
  // but until that is ready we must ensure the expected metrics continue to be emitted
  // to avoid breaking dashboards.
  const onSubmit = useCallback(
    async ({ newPassword, age }: SignupFormData) => {
      if (Number(age) < 13) {
        // this is a session cookie. It will go away once:
        // 1. the user closes the tab
        // and
        // 2. the user closes the browser
        // Both of these have to happen or else the cookie
        // hangs around like a bad smell.

        // TODO: probably a better way to set this?
        document.cookie = 'tooyoung=1;';
        navigate('/cannot_create_account');
        return;
      }
      setBeginSignupLoading(true);

      const options =
        serviceName !== MozServices.Default ? { service: serviceName } : {};
      const { data, error } = await beginSignupHandler(
        queryParamModel.email,
        newPassword,
        options
      );

      setBeginSignupLoading(false);

      if (data) {
        // Persist account data to local storage to match parity with content-server
        // this allows the recent account to be used for /signin
        const accountData: StoredAccountData = {
          email: queryParamModel.email,
          uid: data.SignUp.uid,
          lastLogin: Date.now(),
          sessionToken: data.SignUp.sessionToken,
          verified: false,
          metricsEnabled: true,
        };

        persistAccount(accountData);
        setCurrentAccount(data.SignUp.uid);
        sessionToken(data.SignUp.sessionToken);

        // TODO: send up selected sync engines, FXA-8287
        if (isSyncDesktopIntegration(integration)) {
          notifyFirefoxOfLogin({
            authAt: data.SignUp.authAt,
            email: queryParamModel.email,
            keyFetchToken: data.SignUp.keyFetchToken,
            sessionToken: data.SignUp.sessionToken,
            uid: data.SignUp.uid,
            unwrapBKey: data.unwrapBKey,
            verified: false,
          });
        }

        navigate(`/confirm_signup_code${location.search}`, {
          state: {
            selectedNewsletterSlugs,
            keyFetchToken: data.SignUp.keyFetchToken,
            unwrapBKey: data.unwrapBKey,
          },
          replace: true,
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
      queryParamModel.email,
      location.search,
      integration,
    ]
  );

  return (
    // TODO: FXA-8268, if force_auth && AuthErrors.is(error, 'DELETED_ACCOUNT'):
    //       - forceMessage('Account no longer exists. Recreate it?')
    <AppLayout>
      <BrandMessagingPortal {...{ viewName }} />
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
        <p className="break-all">{queryParamModel.email}</p>

        {canChangeEmail && (
          <FtlMsg id="signup-change-email-link">
            {/* TODO: Replace this with `Link` once index page is Reactified */}
            <a
              href="/"
              className="link-blue text-sm"
              onClick={(e) => {
                e.preventDefault();
                const params = new URLSearchParams(location.search);
                // Tell content-server to stay on index and prefill the email
                params.set('prefillEmail', queryParamModel.email);
                // Passing back the 'email' param causes various behaviors in
                // content-server since it marks the email as "coming from a RP".
                // Also remove `emailFromContent` since we pass that when coming
                // from content-server to Backbone, see Signup container component
                // for more info.
                params.delete('emailFromContent');
                params.delete('email');
                hardNavigateToContentServer(`/?${params.toString()}`);
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
          email: queryParamModel.email,
          onFocusMetricsEvent,
          disableButtonUntilValid: true,
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

        {/* TODO: Update offered engines based on received webchannel message, FXA-8287 */}
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

      <TermsPrivacyAgreement isPocketClient={isPocketClient(serviceName)} />
    </AppLayout>
  );
};

export default Signup;
