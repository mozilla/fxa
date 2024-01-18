/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from '@reach/router';
import { useForm } from 'react-hook-form';
import {
  isOAuthIntegration,
  isSyncDesktopV3Integration,
  useFtlMsgResolver,
} from '../../models';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../lib/metrics';
import { FtlMsg, hardNavigateToContentServer } from 'fxa-react/lib/utils';
import LinkExternal from 'fxa-react/components/LinkExternal';
import FormPasswordWithBalloons from '../../components/FormPasswordWithBalloons';
import InputText from '../../components/InputText';
import ChooseWhatToSync from '../../components/ChooseWhatToSync';
import {
  EngineConfig,
  defaultDesktopV3SyncEngineConfigs,
  getSyncEngineIds,
  syncEngineConfigs,
  webChannelDesktopV3EngineConfigs,
} from '../../components/ChooseWhatToSync/sync-engines';
import ChooseNewsletters from '../../components/ChooseNewsletters';
import { newsletters } from '../../components/ChooseNewsletters/newsletters';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import Banner, { BannerType } from '../../components/Banner';
import CardHeader from '../../components/CardHeader';
import { REACT_ENTRYPOINT } from '../../constants';
import AppLayout from '../../components/AppLayout';
import { SignupFormData, SignupProps } from './interfaces';
import { StoredAccountData, storeAccountData } from '../../lib/storage-utils';
import GleanMetrics from '../../lib/glean';
import { BrandMessagingPortal } from '../../components/BrandMessaging';
import {
  isClientMonitor,
  isClientPocket,
} from '../../models/integrations/client-matching';
import { MozServices } from '../../lib/types';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import firefox from '../../lib/channels/firefox';
import ThirdPartyAuth from '../../components/ThirdPartyAuth';

export const viewName = 'signup';

export const Signup = ({
  integration,
  queryParamModel,
  beginSignupHandler,
  webChannelEngines,
  isSyncWebChannel,
  isSyncOAuth,
}: SignupProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  useEffect(() => {
    GleanMetrics.registration.view();
  }, []);

  const isSync = integration.isSync();
  const email = queryParamModel.email;

  const onFocusMetricsEvent = () => {
    logViewEvent(settingsViewName, `${viewName}.engage`);
    GleanMetrics.registration.engage({ reason: 'password' });
  };

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
  const [declinedSyncEngines, setDeclinedSyncEngines] = useState<string[]>([]);
  // no newsletters are selected by default
  const [selectedNewsletterSlugs, setSelectedNewsletterSlugs] = useState<
    string[]
  >([]);
  const [client, setClient] = useState<MozServices | undefined>(undefined);
  const [hasAgeInputFocused, setHasAgeInputFocused] = useState<boolean>(false);

  useEffect(() => {
    if (isOAuthIntegration(integration)) {
      const clientId = integration.getService();
      if (isClientPocket(clientId)) {
        setClient(MozServices.Pocket);
        setIsAccountSuggestionBannerVisible(true);
      }
      if (isClientMonitor(clientId)) {
        setClient(MozServices.FirefoxMonitor);
      }
    }
  }, [integration]);

  const [offeredSyncEngineConfigs, setOfferedSyncEngineConfigs] = useState<
    EngineConfig[] | undefined
  >();

  useEffect(() => {
    if (webChannelEngines) {
      if (isSyncDesktopV3Integration(integration)) {
        // Desktop v3 web channel message sends additional engines
        setOfferedSyncEngineConfigs([
          ...defaultDesktopV3SyncEngineConfigs,
          ...webChannelDesktopV3EngineConfigs.filter((engine) =>
            webChannelEngines.includes(engine.id)
          ),
        ]);
      } else if (isSyncWebChannel) {
        // OAuth Webchannel context sends all engines
        setOfferedSyncEngineConfigs(
          syncEngineConfigs.filter((engine) =>
            webChannelEngines.includes(engine.id)
          )
        );
      }
    }
  }, [integration, isSyncWebChannel, webChannelEngines]);

  useEffect(() => {
    if (offeredSyncEngineConfigs) {
      const defaultDeclinedSyncEngines = offeredSyncEngineConfigs
        .filter((engineConfig) => !engineConfig.defaultChecked)
        .map((engineConfig) => engineConfig.id);
      setDeclinedSyncEngines(defaultDeclinedSyncEngines);
    }
  }, [offeredSyncEngineConfigs, setDeclinedSyncEngines]);

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<SignupFormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        email,
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
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const onFocusAgeInput = () => {
    if (!hasAgeInputFocused) {
      GleanMetrics.registration.engage({ reason: 'age' });
      setHasAgeInputFocused(true);
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
      GleanMetrics.registration.submit();
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

      const { data, error } = await beginSignupHandler(email, newPassword);

      if (data) {
        GleanMetrics.registration.success();

        const accountData: StoredAccountData = {
          email,
          uid: data.SignUp.uid,
          lastLogin: Date.now(),
          sessionToken: data.SignUp.sessionToken,
          verified: false,
          metricsEnabled: true,
        };

        // Persist account data to local storage to match parity with content-server
        // this allows the recent account to be used for /signin
        storeAccountData(accountData);

        const getOfferedSyncEngines = () =>
          getSyncEngineIds(offeredSyncEngineConfigs || []);

        if (isSyncDesktopV3Integration(integration)) {
          await firefox.fxaLogin({
            email,
            keyFetchToken: data.SignUp.keyFetchToken,
            sessionToken: data.SignUp.sessionToken,
            uid: data.SignUp.uid,
            unwrapBKey: data.unwrapBKey,
            verified: false,
            services: {
              sync: {
                offeredEngines: getOfferedSyncEngines(),
                declinedEngines: declinedSyncEngines,
              },
            },
          });
        }

        navigate(`/confirm_signup_code${location.search}`, {
          state: {
            origin: 'signup',
            selectedNewsletterSlugs,
            keyFetchToken: data.SignUp.keyFetchToken,
            unwrapBKey: data.unwrapBKey,
            // Sync desktop v3 sends a web channel message up on Signup
            // while OAuth Sync does on confirm signup
            ...(isSyncOAuth && {
              offeredSyncEngines: getOfferedSyncEngines(),
              declinedSyncEngines,
            }),
          },
          replace: true,
        });
      }
      if (error) {
        const { message, ftlId } = error;
        setBannerErrorText(ftlMsgResolver.getMsg(ftlId, message));
        // if the request errored, loading state must be marked as false to reenable submission
        setBeginSignupLoading(false);
      }
    },
    [
      beginSignupHandler,
      ftlMsgResolver,
      navigate,
      selectedNewsletterSlugs,
      declinedSyncEngines,
      email,
      location.search,
      integration,
      offeredSyncEngineConfigs,
      isSyncOAuth,
    ]
  );

  const showCWTS = () => {
    if (isSyncWebChannel) {
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
        <p className="break-all">{email}</p>

        <FtlMsg id="signup-change-email-link">
          {/* TODO: Replace this with `Link` once index page is Reactified */}
          <a
            href="/"
            className="link-blue text-sm"
            onClick={(e) => {
              e.preventDefault();
              const params = new URLSearchParams(location.search);
              // Tell content-server to stay on index and prefill the email
              params.set('prefillEmail', email);
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
          disableButtonUntilValid: true,
        }}
        passwordFormType="signup"
        onSubmit={handleSubmit(onSubmit)}
        loading={beginSignupLoading}
      >
        {/* TODO: original component had a SR-only label that is not straightforward to implement with existing InputText component
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
            onFocusCb={onFocusAgeInput}
            onBlurCb={onBlurAgeInput}
            errorText={ageCheckErrorText}
            tooltipPosition="bottom"
            anchorPosition="start"
            prefixDataTestId="age"
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

        {isSync ? (
          showCWTS()
        ) : (
          <ChooseNewsletters
            {...{
              newsletters,
              setSelectedNewsletterSlugs,
            }}
          />
        )}
      </FormPasswordWithBalloons>

      <TermsPrivacyAgreement
        isPocketClient={client === MozServices.Pocket}
        isMonitorClient={client === MozServices.FirefoxMonitor}
      />
      {/* Third party auth is not currently supported for sync */}
      {!isSync && <ThirdPartyAuth />}
    </AppLayout>
  );
};

export default Signup;
