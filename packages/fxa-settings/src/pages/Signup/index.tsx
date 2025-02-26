/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocation } from '@reach/router';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { isEmailMask } from 'fxa-shared/email/helpers';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../components/AppLayout';
import CardHeader from '../../components/CardHeader';
import TermsPrivacyAgreement from '../../components/TermsPrivacyAgreement';
import ThirdPartyAuth from '../../components/ThirdPartyAuth';
import { REACT_ENTRYPOINT } from '../../constants';
import { AuthUiErrors } from '../../lib/auth-errors/auth-errors';
import firefox from '../../lib/channels/firefox';
import { getLocalizedErrorMessage } from '../../lib/error-utils';
import GleanMetrics from '../../lib/glean';
import { useNavigateWithQuery as useNavigate } from '../../lib/hooks/useNavigateWithQuery';
import {
  logViewEvent,
  settingsViewName,
  usePageViewEvent,
} from '../../lib/metrics';
import { StoredAccountData, storeAccountData } from '../../lib/storage-utils';
import { MozServices } from '../../lib/types';
import {
  isOAuthIntegration,
  isOAuthNativeIntegrationSync,
  useFtlMsgResolver,
  useSensitiveDataClient,
} from '../../models';
import {
  isClientMonitor,
  isClientPocket,
  isClientRelay,
} from '../../models/integrations/client-matching';
import { SignupFormData, SignupProps } from './interfaces';
import Banner from '../../components/Banner';
import { SensitiveData } from '../../lib/sensitive-data-client';
import { FormSetupAccount } from '../../components/FormSetupAccount';

export const viewName = 'signup';

export const Signup = ({
  integration,
  queryParamModel,
  beginSignupHandler,
  useSyncEnginesResult: {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    setDeclinedSyncEngines,
    selectedEngines,
  },
}: SignupProps) => {
  const [strapiConfig, setStrapiConfig] = useState<any>(null);
  const sensitiveDataClient = useSensitiveDataClient();
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  useEffect(() => {
    GleanMetrics.registration.view();
  }, []);

  const isOAuth = isOAuthIntegration(integration);
  const isSyncOAuth = isOAuthNativeIntegrationSync(integration);
  const isSync = integration.isSync();
  const isDesktopRelay = integration.isDesktopRelay();
  const email = queryParamModel.email;

  const onFocusMetricsEvent = () => {
    logViewEvent(settingsViewName, `${viewName}.engage`);
    GleanMetrics.registration.engage({ event: { reason: 'password' } });
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

  // no newsletters are selected by default
  const [selectedNewsletterSlugs, setSelectedNewsletterSlugs] = useState<
    string[]
  >([]);
  const [client, setClient] = useState<MozServices | undefined>(undefined);
  const [hasAgeInputFocused, setHasAgeInputFocused] = useState<boolean>(false);

  useEffect(() => {
    if (isOAuth) {
      const clientId = integration.getClientId();
      if (isClientPocket(clientId)) {
        setClient(MozServices.Pocket);
        setIsAccountSuggestionBannerVisible(true);
      }
      if (isClientMonitor(clientId)) {
        setClient(MozServices.Monitor);
      }
      if (isClientRelay(clientId)) {
        setClient(MozServices.Relay);
      }
    }
  }, [integration, isOAuth]);

  async function fetchConfig() {
    const clientId = integration.getClientId();
    const key = '';
    const response = await fetch(
      `https://delicate-bloom-d8e386345e.strapiapp.com/api/clients?filters[clientId]=${clientId}`,
      {
        headers: {
          Authorization: key,
        },
      }
    );

    const data = await response.json();
    console.log('STRAPI', clientId, data);
    return data.data[0];
  }

  async function loadStrapiConfig() {
    try {
      const config = await fetchConfig(); // Assuming fetchConfig is defined elsewhere
      setStrapiConfig(config);

      // Update favicon
      if (config?.faviconUrl) {
        let link =
          (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
          (document.createElement('link') as HTMLLinkElement);
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = config.faviconUrl;

        if (!document.querySelector("link[rel*='icon']")) {
          document.head.appendChild(link);
        }
      }

      // Update page title
      if (config?.pageTitleSignup) {
        document.title = config.pageTitleSignup;
      }
    } catch (error) {
      console.error('Failed to load signup config:', error);
    }
  }

  useEffect(() => {
    loadStrapiConfig();
  }, []);

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
    'auth-error-1031',
    'You must enter your age to sign up'
  );
  const localizedValidAgeError = ftlMsgResolver.getMsg(
    'auth-error-1032',
    'You must enter a valid age to sign up'
  );

  const onFocus = () => {
    if (!isFocused) {
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  const onFocusAgeInput = () => {
    setAgeCheckErrorText('');
    if (!hasAgeInputFocused) {
      GleanMetrics.registration.engage({ event: { reason: 'age' } });
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
      } else if (Number(age) > 130) {
        setAgeCheckErrorText(localizedValidAgeError);
        return;
      }

      // Disable creating accounts with email masks
      if (isEmailMask(email)) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          AuthUiErrors.EMAIL_MASK_NEW_ACCOUNT
        );
        setBannerErrorText(localizedErrorMessage);
        return;
      }

      setBeginSignupLoading(true);

      const atLeast18AtReg = Number(age) >= 18 ? true : null;

      const { data, error } = await beginSignupHandler(
        email,
        newPassword,
        atLeast18AtReg
      );

      if (data) {
        GleanMetrics.registration.success();

        const accountData: StoredAccountData = {
          email,
          uid: data.signUp.uid,
          lastLogin: Date.now(),
          sessionToken: data.signUp.sessionToken,
          verified: false,
          metricsEnabled: true,
        };

        // Persist account data to local storage to match parity with content-server
        // this allows the recent account to be used for /signin
        storeAccountData(accountData);

        // Set these for use in ConfirmSignupCode
        sensitiveDataClient.setDataType(SensitiveData.Key.Auth, {
          keyFetchToken: data.signUp.keyFetchToken,
          unwrapBKey: data.unwrapBKey,
        });

        if (isSync) {
          const syncEngines = {
            offeredEngines: offeredSyncEngines,
            declinedEngines: declinedSyncEngines,
          };
          GleanMetrics.registration.cwts({
            sync: { cwts: selectedEngines },
          });

          firefox.fxaLogin({
            email,
            // Do not send these values if OAuth. Mobile doesn't care about this message, and
            // sending these values can cause intermittent sync disconnect issues in oauth desktop.
            ...(!isOAuth && {
              // keyFetchToken and unwrapBKey should always exist if Sync integration
              keyFetchToken: data.signUp.keyFetchToken!,
              unwrapBKey: data.unwrapBKey!,
            }),
            sessionToken: data.signUp.sessionToken,
            uid: data.signUp.uid,
            verified: false,
            services: {
              sync: syncEngines,
            },
          });
        } else if (isDesktopRelay) {
          firefox.fxaLogin({
            email,
            sessionToken: data.signUp.sessionToken,
            uid: data.signUp.uid,
            verified: false,
            services: {
              relay: {},
            },
          });
        } else {
          GleanMetrics.registration.marketing({
            standard: {
              marketing: {
                news: selectedNewsletterSlugs.indexOf('mozilla-and-you') >= 0,
                take_action:
                  selectedNewsletterSlugs.indexOf('mozilla-foundation') >= 0,
                testing: selectedNewsletterSlugs.indexOf('test-pilot') >= 0,
              },
            },
          });
        }

        navigate('/confirm_signup_code', {
          state: {
            origin: 'signup',
            selectedNewsletterSlugs,
            // Sync desktop v3 sends a web channel message up on Signup
            // while OAuth Sync (mobile) does on confirm signup.
            // Once mobile clients read this from fxaLogin to match
            // oauth desktop, we can stop sending this on confirm signup code.
            ...(isSyncOAuth && {
              offeredSyncEngines,
              declinedSyncEngines,
            }),
          },
          replace: true,
        });
      }
      if (error) {
        const localizedErrorMessage = getLocalizedErrorMessage(
          ftlMsgResolver,
          error
        );
        setBannerErrorText(localizedErrorMessage);
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
      isSync,
      offeredSyncEngines,
      selectedEngines,
      isSyncOAuth,
      localizedValidAgeError,
      isDesktopRelay,
      isOAuth,
      sensitiveDataClient,
    ]
  );

  return (
    // TODO: FXA-8268, if force_auth && AuthErrors.is(error, 'DELETED_ACCOUNT'):
    //       - forceMessage('Account no longer exists. Recreate it?')
    <AppLayout>
      {isDesktopRelay ? (
        <>
          <CardHeader
            headingText="Create a password"
            headingTextFtlId="signup-heading-relay"
          />
          <FtlMsg id="signup-relay-info">
            <p className="text-sm">
              A password is needed to securely manage your masked emails and
              access Mozilla’s security tools.
            </p>
          </FtlMsg>
        </>
      ) : strapiConfig ? (
        <CardHeader
          headingText={strapiConfig.signupHeader}
          subheadingText={strapiConfig.signupSubHeader}
        />
      ) : (
        <CardHeader
          headingText="Set your password"
          headingTextFtlId="signup-heading"
        />
      )}

      {bannerErrorText && (
        <Banner type="error" content={{ localizedHeading: bannerErrorText }} />
      )}

      {/* AccountSuggestion is only shown to Pocket clients */}
      {isAccountSuggestionBannerVisible && (
        <Banner
          type="info"
          content={{
            localizedHeading: ftlMsgResolver.getMsg(
              'signup-pocket-info-banner',
              'Why do I need to create this account?'
            ),
          }}
          link={{
            url: 'https://support.mozilla.org/kb/pocket-firefox-account-migration',
            localizedText: ftlMsgResolver.getMsg(
              'signup-pocket-info-banner-link',
              'Find out here'
            ),
            gleanId: 'signup-pocket-info-banner-link',
          }}
          dismissButton={{
            action: () => setIsAccountSuggestionBannerVisible(false),
          }}
        />
      )}

      <div className="mt-4 mb-6">
        <p className="break-all">{email}</p>

        <FtlMsg id="signup-change-email-link">
          {/* TODO: Replace this with `Link` once index page is Reactified */}
          <a
            href="/"
            className="link-blue text-sm"
            onClick={async (e) => {
              e.preventDefault();
              GleanMetrics.registration.changeEmail();
              await GleanMetrics.isDone(); // since we navigate away to Backbone
              const params = new URLSearchParams(location.search);
              // Tell content-server to stay on index and prefill the email
              params.set('prefillEmail', email);
              // Passing back the 'email' param causes various behaviors in
              // content-server since it marks the email as "coming from a RP".
              // Also remove `emailStatusChecked` since we pass that when coming
              // from content-server to Backbone, see Signup container component
              // for more info.
              params.delete('emailStatusChecked');
              params.delete('email');
              params.delete('login_hint');
              hardNavigate(`/?${params.toString()}`);
            }}
          >
            Change email
          </a>
        </FtlMsg>
      </div>

      <FormSetupAccount
        {...{
          formState,
          errors,
          trigger,
          register,
          getValues,
          onFocus,
          email,
          onFocusMetricsEvent,
          handleSubmit,
          onSubmit,
          isSync,
          offeredSyncEngineConfigs,
          setDeclinedSyncEngines,
          isDesktopRelay,
          setSelectedNewsletterSlugs,
          ageCheckErrorText,
          setAgeCheckErrorText,
          onFocusAgeInput,
          onBlurAgeInput,
          strapiConfig,
        }}
        loading={beginSignupLoading}
        onSubmit={handleSubmit(onSubmit)}
      />

      {/* Third party auth is not currently supported for sync */}
      {!isSync && !isDesktopRelay && strapiConfig?.showThirdPartyAuth && (
        <ThirdPartyAuth viewName="signup" />
      )}

      <TermsPrivacyAgreement
        isPocketClient={client === MozServices.Pocket}
        isMonitorClient={client === MozServices.Monitor}
        isRelayClient={client === MozServices.Relay}
        {...{ isDesktopRelay }}
      />
    </AppLayout>
  );
};

export default Signup;
