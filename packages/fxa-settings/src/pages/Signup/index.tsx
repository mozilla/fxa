/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useLocation } from '@reach/router';
import LinkExternal from 'fxa-react/components/LinkExternal';
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { FtlMsg, hardNavigate } from 'fxa-react/lib/utils';
import { isEmailMask } from 'fxa-shared/email/helpers';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import AppLayout from '../../components/AppLayout';
import Banner, { BannerType } from '../../components/Banner';
import CardHeader from '../../components/CardHeader';
import ChooseNewsletters from '../../components/ChooseNewsletters';
import { newsletters } from '../../components/ChooseNewsletters/newsletters';
import ChooseWhatToSync from '../../components/ChooseWhatToSync';
import {
  defaultDesktopV3SyncEngineConfigs,
  getSyncEngineIds,
  syncEngineConfigs,
  webChannelDesktopV3EngineConfigs,
} from '../../components/ChooseWhatToSync/sync-engines';
import FormPasswordWithBalloons from '../../components/FormPasswordWithBalloons';
import InputText from '../../components/InputText';
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
  isSyncDesktopV3Integration,
  useFtlMsgResolver,
} from '../../models';
import {
  isClientMonitor,
  isClientPocket,
} from '../../models/integrations/client-matching';
import { SignupFormData, SignupProps } from './interfaces';

export const viewName = 'signup';

export const Signup = ({
  integration,
  queryParamModel,
  beginSignupHandler,
  webChannelEngines,
}: SignupProps) => {
  usePageViewEvent(viewName, REACT_ENTRYPOINT);

  useEffect(() => {
    GleanMetrics.registration.view();
  }, []);

  const isOAuth = isOAuthIntegration(integration);
  const isSyncOAuth = isOAuthNativeIntegrationSync(integration);
  const isSyncDesktopV3 = isSyncDesktopV3Integration(integration);
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
  const [declinedSyncEngines, setDeclinedSyncEngines] = useState<string[]>([]);
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
    }
  }, [integration, isOAuth]);

  const [offeredSyncEngineConfigs, setOfferedSyncEngineConfigs] = useState<
    typeof syncEngineConfigs | undefined
  >();

  useEffect(() => {
    if (webChannelEngines) {
      if (isSyncDesktopV3) {
        // Desktop v3 web channel message sends additional engines
        setOfferedSyncEngineConfigs([
          ...defaultDesktopV3SyncEngineConfigs,
          ...webChannelDesktopV3EngineConfigs.filter((engine) =>
            webChannelEngines.includes(engine.id)
          ),
        ]);
      } else if (isSyncOAuth) {
        // OAuth Webchannel context sends all engines
        setOfferedSyncEngineConfigs(
          syncEngineConfigs.filter((engine) =>
            webChannelEngines.includes(engine.id)
          )
        );
      }
    }
  }, [isSyncDesktopV3, isSyncOAuth, webChannelEngines]);

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

        const getOfferedSyncEngines = () =>
          getSyncEngineIds(offeredSyncEngineConfigs || []);

        if (isSync) {
          const syncEngines = {
            offeredEngines: getOfferedSyncEngines(),
            declinedEngines: declinedSyncEngines,
          };
          const syncOptions = syncEngines.offeredEngines.reduce(
            (acc, syncEngId) => {
              acc[syncEngId] = !declinedSyncEngines.includes(syncEngId);
              return acc;
            },
            {} as Record<string, boolean>
          );
          GleanMetrics.registration.cwts({ sync: { cwts: syncOptions } });
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
            keyFetchToken: data.signUp.keyFetchToken,
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
      offeredSyncEngineConfigs,
      isSyncOAuth,
      localizedValidAgeError,
      isDesktopRelay,
      isOAuth,
    ]
  );

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
      ) : (
        <CardHeader
          headingText="Set your password"
          headingTextFtlId="signup-heading"
        />
      )}

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
            anchorPosition="end"
            prefixDataTestId="age"
          />
        </FtlMsg>
        <FtlMsg id="signup-coppa-check-explanation-link">
          <LinkExternal
            href="https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites"
            className={`link-blue text-start text-sm py-1 -mt-2 self-start ${
              isDesktopRelay ? 'mb-8' : 'mb-4'
            }`}
            onClick={() => GleanMetrics.registration.whyWeAsk()}
          >
            Why do we ask?
          </LinkExternal>
        </FtlMsg>

        {isSync
          ? showCWTS()
          : !isDesktopRelay && (
              <ChooseNewsletters
                {...{
                  newsletters,
                  setSelectedNewsletterSlugs,
                }}
              />
            )}
      </FormPasswordWithBalloons>

      {/* Third party auth is not currently supported for sync */}
      {!isSync && !isDesktopRelay && <ThirdPartyAuth viewName="signup" />}

      <TermsPrivacyAgreement
        isPocketClient={client === MozServices.Pocket}
        isMonitorClient={client === MozServices.Monitor}
        marginClassName={isDesktopRelay ? 'mt-8' : undefined}
      />
    </AppLayout>
  );
};

export default Signup;
