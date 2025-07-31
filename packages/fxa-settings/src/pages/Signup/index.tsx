/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { FtlMsg } from 'fxa-react/lib/utils';
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
import { useNavigateWithQuery } from '../../lib/hooks/useNavigateWithQuery';
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
import { checkPaymentMethodsWillSync } from '../../lib/sync-engines';
import FormPasswordWithInlineCriteria from '../../components/FormPasswordWithInlineCriteria';

export const viewName = 'signup';

export const Signup = ({
  integration,
  email,
  beginSignupHandler,
  useSyncEnginesResult: {
    offeredSyncEngines,
    offeredSyncEngineConfigs,
    declinedSyncEngines,
    selectedEnginesForGlean,
  },
  deeplink,
  flowQueryParams,
}: SignupProps) => {
  const sensitiveDataClient = useSensitiveDataClient();

  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  useEffect(() => {
    GleanMetrics.registration.view();
  }, []);

  const isOAuth = isOAuthIntegration(integration);
  const isSyncOAuth = isOAuthNativeIntegrationSync(integration);
  const isSync = integration.isSync();
  const isDesktopRelay = integration.isDesktopRelay();
  const paymentMethodsWillSync =
    isSync && checkPaymentMethodsWillSync(offeredSyncEngines);

  const onFocusMetricsEvent = () => {
    logViewEvent(settingsViewName, `${viewName}.engage`);
    GleanMetrics.registration.engage({ event: { reason: 'password' } });
  };

  const [beginSignupLoading, setBeginSignupLoading] = useState<boolean>(false);
  const [bannerErrorText, setBannerErrorText] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [
    isAccountSuggestionBannerVisible,
    setIsAccountSuggestionBannerVisible,
  ] = useState<boolean>(false);
  const navigateWithQuery = useNavigateWithQuery();

  // no newsletters are selected by default
  const [selectedNewsletterSlugs, setSelectedNewsletterSlugs] = useState<
    string[]
  >([]);
  const [client, setClient] = useState<MozServices | undefined>(undefined);

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

  const { handleSubmit, register, getValues, errors, formState, trigger } =
    useForm<SignupFormData>({
      mode: 'onChange',
      criteriaMode: 'all',
      defaultValues: {
        email,
        newPassword: '',
        confirmPassword: '',
      },
    });

  const ftlMsgResolver = useFtlMsgResolver();

  const onFocus = () => {
    if (!isFocused) {
      logViewEvent('flow', `${viewName}.engage`, REACT_ENTRYPOINT);
      setIsFocused(true);
    }
  };

  // TODO: Add metrics events to match parity with content-server in FXA-8302
  // The legacy amplitude events will eventually be replaced by Glean,
  // but until that is ready we must ensure the expected metrics continue to be emitted
  // to avoid breaking dashboards.
  const onSubmit = useCallback(
    async ({ newPassword }: SignupFormData) => {
      GleanMetrics.registration.submit();

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

      const { data, error } = await beginSignupHandler(email, newPassword);

      if (data) {
        GleanMetrics.registration.submitSuccess();

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
            sync: { cwts: selectedEnginesForGlean },
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

        navigateWithQuery('/confirm_signup_code', {
          state: {
            origin: 'signup',
            selectedNewsletterSlugs,
            // Sync desktop v3 sends a web channel message up on Signup
            // while OAuth Sync does on confirm signup.
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
      navigateWithQuery,
      selectedNewsletterSlugs,
      declinedSyncEngines,
      email,
      isSync,
      offeredSyncEngines,
      selectedEnginesForGlean,
      isSyncOAuth,
      isDesktopRelay,
      isOAuth,
      sensitiveDataClient,
    ]
  );

  const isDeeplinking = !!deeplink;
  if (isDeeplinking) {
    // To avoid flickering, we only render third party auth and navigate
    return (
      <ThirdPartyAuth
        showSeparator={false}
        viewName="deeplink"
        deeplink={deeplink}
        flowQueryParams={flowQueryParams}
      />
    );
  }

  const cmsInfo = integration.getCmsInfo();

  return (
    // TODO: FXA-8268, if force_auth && AuthErrors.is(error, 'DELETED_ACCOUNT'):
    //       - forceMessage('Account no longer exists. Recreate it?')
    <AppLayout cmsInfo={cmsInfo}>
      {cmsInfo ? (
        <>
          {cmsInfo?.shared?.logoUrl && cmsInfo?.shared?.logoAltText && (
            <img
              src={cmsInfo?.shared.logoUrl}
              alt={cmsInfo?.shared.logoAltText}
              className="justify-start mb-4 max-h-[40px]"
            />
          )}
          <h1 className="card-header">
            {cmsInfo?.SignupSetPasswordPage?.headline}
          </h1>
          <p className="mt-1 text-sm">
            {cmsInfo?.SignupSetPasswordPage?.description}
          </p>
        </>
      ) : (
        <>
          <CardHeader
            headingText="Create a password"
            headingTextFtlId="signup-heading-v2"
          />

          {isDesktopRelay && (
            <FtlMsg id="signup-relay-info">
              <p className="text-base">
                A password is needed to securely manage your masked emails and
                access Mozilla’s security tools.
              </p>
            </FtlMsg>
          )}

          {isSync &&
            (paymentMethodsWillSync ? (
              <FtlMsg id="signup-sync-info-with-payment">
                <p className="text-base">
                  Sync your passwords, payment methods, bookmarks, and more
                  everywhere you use Firefox.
                </p>
              </FtlMsg>
            ) : (
              <FtlMsg id="signup-sync-info">
                <p className="text-base">
                  Sync your passwords, bookmarks, and more everywhere you use
                  Firefox.
                </p>
              </FtlMsg>
            ))}
        </>
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

              const searchParams = new URLSearchParams(window.location.search);
              searchParams.delete('email');
              navigateWithQuery(`/?${searchParams.toString()}`, {
                state: {
                  prefillEmail: email,
                },
              });
            }}
          >
            Change email
          </a>
        </FtlMsg>
      </div>

      <FormPasswordWithInlineCriteria
        {...{
          passwordFormType: 'signup',
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
          offeredSyncEngineConfigs,
          requirePasswordConfirmation: isSync,
          setSelectedNewsletterSlugs,
          cmsButton: {
            text: cmsInfo?.SignupSetPasswordPage?.primaryButtonText,
            color: cmsInfo?.shared?.buttonColor,
          },
        }}
        loading={beginSignupLoading}
        onSubmit={handleSubmit(onSubmit)}
      />

      {/* Third party auth is not currently supported for sync */}
      {!isSync && !isDesktopRelay && (
        <ThirdPartyAuth viewName="signup" flowQueryParams={flowQueryParams} />
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
