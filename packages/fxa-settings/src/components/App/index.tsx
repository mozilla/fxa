/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Routes, Route, useLocation, useNavigate } from 'react-router';
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useLayoutEffect,
  useMemo,
  startTransition,
} from 'react';

import { QueryParams } from '../..';
import { persistAccount, setCurrentAccount } from '../../lib/storage-utils';
import { currentAccount, getAccountByUid } from '../../lib/cache';
import { firefox } from '../../lib/channels/firefox';
import * as MetricsFlow from '../../lib/metrics-flow';
import GleanMetrics from '../../lib/glean';
import * as Metrics from '../../lib/metrics';
import { MozServices } from '../../lib/types';

import {
  Integration,
  isOAuthIntegration,
  useConfig,
  useInitialMetricsQueryState,
  useIntegration,
  useLocalSignedInQueryState,
  useSession,
  isProbablyFirefox,
  useDefaultCmsState,
  isWebIntegration,
} from '../../models';
import {
  initializeSettingsContext,
  SettingsContext,
} from '../../models/contexts/SettingsContext';
import { AccountStateProvider } from '../../models/contexts/AccountStateContext';

import sentryMetrics from 'fxa-shared/sentry/browser';
// Components
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { ScrollToTop } from '../Settings/ScrollToTop';
import useFxAStatus from '../../lib/hooks/useFxAStatus';
import AppLayout from '../AppLayout';
import { PromoQrMobile } from '../PromoQrMobile';
import { hardNavigate } from 'fxa-react/lib/utils';
import { registerNavigate } from '../../lib/utilities';

// Pages
const SignupConfirmedSync = lazy(
  () => import('../../pages/Signup/SignupConfirmedSync')
);
const ServiceWelcome = lazy(
  () => import('../../pages/PostVerify/ServiceWelcome')
);
const IndexContainer = lazy(() => import('../../pages/Index/container'));
const Clear = lazy(() => import('../../pages/Clear'));

const InlineTotpSetupContainer = lazy(
  () => import('../../pages/InlineTotpSetup/container')
);
const InlineRecoverySetupContainer = lazy(
  () => import('../../pages/InlineRecoverySetupFlow/container')
);

const Legal = lazy(() => import('../../pages/Legal'));
const LegalPrivacy = lazy(() => import('../../pages/Legal/Privacy'));
const LegalTerms = lazy(() => import('../../pages/Legal/Terms'));
const ThirdPartyAuthCallback = lazy(
  () => import('../../pages/PostVerify/ThirdPartyAuthCallback')
);
const ResetPasswordContainer = lazy(
  () => import('../../pages/ResetPassword/ResetPassword/container')
);
const ConfirmResetPasswordContainer = lazy(
  () => import('../../pages/ResetPassword/ConfirmResetPassword/container')
);
const CompleteResetPasswordContainer = lazy(
  () => import('../../pages/ResetPassword/CompleteResetPassword/container')
);
const AccountRecoveryConfirmKeyContainer = lazy(
  () => import('../../pages/ResetPassword/AccountRecoveryConfirmKey/container')
);
const ConfirmTotpResetPasswordContainer = lazy(
  () => import('../../pages/ResetPassword/ConfirmTotpResetPassword/container')
);
const ConfirmBackupCodeResetPasswordContainer = lazy(
  () =>
    import('../../pages/ResetPassword/ConfirmBackupCodeResetPassword/container')
);
const ResetPasswordConfirmedContainer = lazy(
  () => import('../../pages/ResetPassword/ResetPasswordConfirmed/container')
);
const ResetPasswordWithRecoveryKeyVerifiedContainer = lazy(
  () =>
    import(
      '../../pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified/container'
    )
);
const CompleteSigninContainer = lazy(
  () => import('../../pages/Signin/CompleteSignin/container')
);
const SigninContainer = lazy(() => import('../../pages/Signin/container'));
const ReportSigninContainer = lazy(
  () => import('../../pages/Signin/ReportSignin/container')
);
const SigninBounced = lazy(() => import('../../pages/Signin/SigninBounced'));
const SigninConfirmed = lazy(
  () => import('../../pages/Signin/SigninConfirmed')
);
const SigninPasskeyFallbackContainer = lazy(
  () => import('../../pages/Signin/SigninPasskeyFallback/container')
);
const SigninRecoveryCodeContainer = lazy(
  () => import('../../pages/Signin/SigninRecoveryCode/container')
);
const SigninReported = lazy(() => import('../../pages/Signin/SigninReported'));
const SigninPasswordlessCodeContainer = lazy(
  () => import('../../pages/Signin/SigninPasswordlessCode/container')
);
const SigninTokenCodeContainer = lazy(
  () => import('../../pages/Signin/SigninTokenCode/container')
);
const SigninTotpCodeContainer = lazy(
  () => import('../../pages/Signin/SigninTotpCode/container')
);
const SigninUnblockContainer = lazy(
  () => import('../../pages/Signin/SigninUnblock/container')
);
const ConfirmSignupCodeContainer = lazy(
  () => import('../../pages/Signup/ConfirmSignupCode/container')
);
const SignupContainer = lazy(() => import('../../pages/Signup/container'));
const PrimaryEmailVerified = lazy(
  () => import('../../pages/Signup/PrimaryEmailVerified')
);
const SignupConfirmed = lazy(
  () => import('../../pages/Signup/SignupConfirmed')
);
const WebChannelExample = lazy(() => import('../../pages/WebChannelExample'));
const PocDeepLink = lazy(() => import('../../pages/PocDeepLink'));
const PocPairInit = lazy(() => import('../../pages/PocPairInit'));
const PocPairStart = lazy(() => import('../../pages/PocPairStart'));
const SignoutSync = lazy(() => import('../Settings/SignoutSync'));
const InlineRecoveryKeySetupContainer = lazy(
  () => import('../../pages/InlineRecoveryKeySetup/container')
);
const SetPasswordContainer = lazy(
  () => import('../../pages/PostVerify/SetPassword/container')
);
const SigninRecoveryChoiceContainer = lazy(
  () => import('../../pages/Signin/SigninRecoveryChoice/container')
);
const SigninRecoveryPhoneContainer = lazy(
  () => import('../../pages/Signin/SigninRecoveryPhone/container')
);

// Pairing pages
const ConnectAnotherDevice = lazy(
  () => import('../../pages/ConnectAnotherDevice')
);
const PairIndex = lazy(() => import('../../pages/Pair/Index'));
const PairFailure = lazy(() => import('../../pages/Pair/Failure'));
const PairSuccess = lazy(() => import('../../pages/Pair/Success'));
const PairUnsupported = lazy(() => import('../../pages/Pair/Unsupported'));
const PairAuthAllow = lazy(() => import('../../pages/Pair/AuthAllow'));
const PairAuthComplete = lazy(() => import('../../pages/Pair/AuthComplete'));
const PairAuthTotp = lazy(() => import('../../pages/Pair/AuthTotp'));
const PairAuthWaitForSupp = lazy(
  () => import('../../pages/Pair/AuthWaitForSupp')
);
const PairSupp = lazy(() => import('../../pages/Pair/Supp'));
const PairSuppAllow = lazy(() => import('../../pages/Pair/SuppAllow'));
const PairSuppWaitForAuth = lazy(
  () => import('../../pages/Pair/SuppWaitForAuth')
);

const AuthorizationContainer = lazy(
  () => import('../../pages/Authorization/container')
);
const CookiesDisabled = lazy(() => import('../../pages/CookiesDisabled'));
const OAuthDataError = lazy(() => import('../OAuthDataError'));
const ResetPasswordRecoveryChoiceContainer = lazy(
  () =>
    import('../../pages/ResetPassword/ResetPasswordRecoveryChoice/container')
);
const ResetPasswordRecoveryPhoneContainer = lazy(
  () => import('../../pages/ResetPassword/ResetPasswordRecoveryPhone/container')
);

const Settings = lazy(() => import('../Settings'));

export const App = ({ flowQueryParams }: { flowQueryParams: QueryParams }) => {
  const { data: isSignedInData } = useLocalSignedInQueryState();

  // Configure Sentry before any other hooks that might throw.
  // If no user is signed in:
  // - we can't send any identifying metrics to sentry
  // - we can't determine whether or not they have opted out
  if (isSignedInData === undefined || isSignedInData.isSignedIn === false) {
    sentryMetrics.enable();
  }

  const config = useConfig();
  const session = useSession();
  const integration = useIntegration();
  const navigate = useNavigate();

  // Register navigate so out-of-component code (e.g. AppContext errorHandler)
  // can perform client-side navigations with state.
  useEffect(() => {
    registerNavigate(navigate);
  }, [navigate]);

  // GQL call for minimal metrics data
  const { loading: metricsLoading, data } = useInitialMetricsQueryState() ?? {};

  // Determine if user is actually signed in
  const [isSignedIn, setIsSignedIn] = useState<boolean | undefined>(undefined);

  // Whether the user is signed into Firefox via WebChannel
  const [isSignedIntoFirefox, setIsSignedIntoFirefox] = useState(false);

  // Track current page's split layout state to prevent visual flashing during navigation.
  // This state is updated by AppLayout and read by the Suspense fallback to preserve
  // the origin page's layout until the destination page loads.
  const [currentSplitLayout, setCurrentSplitLayout] = useState<boolean>(false);

  useEffect(() => {
    const initializeSession = async () => {
      if (!integration) {
        return;
      }

      // When running inside Firefox, fetch the session token from the browser
      // via WebChannel. The native app owns the source-of-truth token;
      // localStorage may hold a stale value from a previous session.
      if (isProbablyFirefox()) {
        const userFromBrowser = await firefox.requestSignedInUser(
          integration.data?.context || '',
          // TODO with React pairing flow, update this if pairing flow
          false,
          integration.data?.service || ''
        );

        // Don't intialize session state from partially succesful firefox logins (ie sync, relay, smartwindow).
        // This reprensents an abandonded login. Basically the user hasn't actually confirmed the session yet, so
        // don't assume it's valid.
        if (
          userFromBrowser?.sessionToken &&
          userFromBrowser.verified === true
        ) {
          const isValidSession = await session.isValid(
            userFromBrowser.sessionToken
          );
          if (isValidSession) {
            setIsSignedIntoFirefox(true);
            const cachedUser = getAccountByUid(userFromBrowser.uid);
            // Refresh the token without switching the "current" account.
            persistAccount(
              cachedUser
                ? {
                    ...cachedUser,
                    sessionToken: userFromBrowser.sessionToken,
                  }
                : userFromBrowser
            );
            if (!currentAccount()?.uid) {
              setCurrentAccount(userFromBrowser.uid);
            }
            startTransition(() => {
              setIsSignedIn(true);
            });
            return;
          }
        }
        // Fall through to localStorage checks if WebChannel timed out
        // or the token was invalid.
      }

      if (isSignedInData?.isSignedIn === true) {
        startTransition(() => {
          setIsSignedIn(true);
        });
        return;
      }

      const localUser = currentAccount();
      if (
        localUser?.sessionToken &&
        (await session.isValid(localUser.sessionToken))
      ) {
        startTransition(() => {
          setIsSignedIn(true);
        });
        return;
      }

      startTransition(() => {
        setIsSignedIn(false);
      });
    };
    initializeSession();
  }, [integration, isSignedInData?.isSignedIn, session]);

  const metricsEnabled = useMemo(() => {
    if (metricsLoading || !integration || isSignedIn === undefined) {
      return;
    }

    return data?.account?.metricsEnabled || !isSignedIn;
  }, [metricsLoading, integration, isSignedIn, data?.account?.metricsEnabled]);

  const metricsFlow = useMemo(
    () => MetricsFlow.init(flowQueryParams),
    [flowQueryParams]
  );

  const updatedFlowQueryParams = useMemo(
    () => ({ ...flowQueryParams, ...metricsFlow }),
    [flowQueryParams, metricsFlow]
  );

  // Initialize Glean metrics as early as possible,
  // before the browser paints and before child components run their effects.
  // useLayoutEffect ensures this happens immediately after DOM mutations,
  // but before the screen is painted or child useEffect hooks are called.
  useLayoutEffect(() => {
    if (!metricsEnabled || !integration || GleanMetrics.getEnabled()) {
      return;
    }

    GleanMetrics.initialize(
      {
        ...config.glean,
        enabled: metricsEnabled,
        appDisplayVersion: config.version,
        appChannel: config.glean.appChannel,
      },
      {
        metricsFlow,
        userAgent: navigator.userAgent,
        integration,
      }
    );
  }, [metricsEnabled, integration, config.glean, config.version, metricsFlow]);

  useEffect(() => {
    if (!metricsEnabled) {
      return;
    }
    Metrics.init(metricsEnabled, updatedFlowQueryParams);
    if (data?.account?.metricsEnabled) {
      Metrics.initUserPreferences({
        recoveryKey: data.account.recoveryKey?.exists ?? false,
        hasSecondaryVerifiedEmail:
          data.account.emails.length > 1 && data.account.emails[1].verified,
        totpActive:
          (data.account.totp?.exists && data.account.totp?.verified) ?? false,
      });
    }
  }, [
    config,
    data,
    data?.account?.metricsEnabled,
    data?.account?.emails,
    data?.account?.totp,
    data?.account?.recoveryKey,
    isSignedIn,
    metricsFlow,
    metricsLoading,
    metricsEnabled,
    updatedFlowQueryParams,
  ]);

  useEffect(() => {
    if (metricsEnabled || isSignedIn === false) {
      sentryMetrics.enable();
    } else {
      sentryMetrics.disable();
    }
  }, [
    data?.account?.metricsEnabled,
    config.sentry,
    config.version,
    metricsLoading,
    isSignedIn,
    metricsEnabled,
  ]);

  // Fail fast: if the OAuth client-info fetch in useClientInfoState exhausted its
  // retries, surface the user-facing error immediately rather than waiting downstream
  // failures to occur.
  if (
    integration &&
    isOAuthIntegration(integration) &&
    integration.clientInfoLoadFailed
  ) {
    try {
      integration.checkClientInfo();
    } catch (err: any) {
      return (
        <Suspense fallback={<AppLayout loading />}>
          <OAuthDataError error={err} />
        </Suspense>
      );
    }
  }

  // Wait until app initialization is complete
  if (
    metricsLoading ||
    !integration ||
    isSignedIn === undefined ||
    metricsEnabled === undefined
  ) {
    return window.location.pathname?.includes('/settings') ? (
      <LoadingSpinner fullScreen />
    ) : (
      <AppLayout cmsInfo={integration?.getCmsInfo()} loading />
    );
  }

  const cmsInfo = integration.getCmsInfo();

  return (
    <Suspense
      fallback={
        <AppLayout cmsInfo={cmsInfo} loading splitLayout={currentSplitLayout} />
      }
    >
      <Routes>
        <Route
          path="/settings/*"
          element={
            <SettingsRoutes
              {...{
                isSignedIn,
                integration,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/*"
          element={
            <AuthAndAccountSetupRoutes
              {...{
                isSignedIn,
                integration,
                flowQueryParams: updatedFlowQueryParams,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
              }}
            />
          }
        />
      </Routes>
    </Suspense>
  );
};

const SettingsRoutes = ({
  isSignedIn,
  integration,
  isSignedIntoFirefox,
  setCurrentSplitLayout,
}: {
  isSignedIn: boolean;
  integration: Integration;
  isSignedIntoFirefox: boolean;
  setCurrentSplitLayout: (value: boolean) => void;
}) => {
  const location = useLocation();
  const isSync = integration != null ? integration.isSync() : false;

  // Check localStorage directly — prop is async, localStorage is sync after storeAccountData()
  const { data: localSignedInData } = useLocalSignedInQueryState();
  const effectiveIsSignedIn = isSignedIn || localSignedInData?.isSignedIn;

  // If the user is not signed in, they cannot access settings! Direct them accordingly
  // Deferring navigation to an effect prevents React from detecting a navigation
  // during render, which can trigger "A component suspended while responding to
  // synchronous input" and cause the UI to be replaced by a fallback. Running
  // hardNavigate here ensures the update occurs after render.

  useEffect(() => {
    if (!effectiveIsSignedIn && !isSync) {
      // For regular RP / web logins, maybe the session token expired.
      // In this case we just send them to the root.
      const params = new URLSearchParams(location.search);
      params.set('redirect_to', location.pathname);
      hardNavigate(`/?${params.toString()}`);
    }
  }, [effectiveIsSignedIn, isSync, location.pathname, location.search]);

  if (!effectiveIsSignedIn) {
    if (isSync) {
      // For sync this means we somehow dropped the sign out message, which is
      // a known issue in android. In this case, our best option is to ask the
      // user to manually signout from sync.
      return <SignoutSync />;
    }
    return <AppLayout cmsInfo={integration.getCmsInfo()} loading />;
  }

  const settingsContext = initializeSettingsContext();
  return (
    <AccountStateProvider>
      <SettingsContext.Provider value={settingsContext}>
        <ScrollToTop>
          <Settings
            {...{ integration, isSignedIntoFirefox, setCurrentSplitLayout }}
          />
        </ScrollToTop>
      </SettingsContext.Provider>
    </AccountStateProvider>
  );
};

const AuthAndAccountSetupRoutes = ({
  isSignedIn,
  integration,
  flowQueryParams,
  isSignedIntoFirefox,
  setCurrentSplitLayout,
}: {
  isSignedIn: boolean;
  integration: Integration;
  flowQueryParams: QueryParams;
  isSignedIntoFirefox: boolean;
  setCurrentSplitLayout: (value: boolean) => void;
}) => {
  const localAccount = currentAccount();
  // TODO: MozServices / string discrepancy, FXA-6802
  let serviceName: MozServices;
  const location = useLocation();
  const { enabled: gleanEnabled } = GleanMetrics.useGlean();

  useEffect(() => {
    gleanEnabled && GleanMetrics.pageLoad(location.pathname);
  }, [location.pathname, gleanEnabled]);

  const useFxAStatusResult = useFxAStatus(integration);
  const defaultCmsState = useDefaultCmsState({
    enabled: isWebIntegration(integration) || integration.isDesktopSync(),
  });
  try {
    // Handle getServiceName() errors that occur when OAuth scope validation fails.
    // This can happen when scopes are missing, invalid, or filtered out during
    // trusted/untrusted client validation. For OAuth integrations, show a user-friendly
    // error page instead of letting it bubble up to the general error boundary.
    serviceName = integration.getServiceName() as MozServices;
  } catch (err: any) {
    if (isOAuthIntegration(integration)) {
      return (
        <Suspense fallback={<AppLayout loading />}>
          <OAuthDataError error={err} />
        </Suspense>
      );
    }
    throw err;
  }

  return (
    <>
      <Routes>
        {/* Index */}
        <Route
          path="/"
          element={
            <IndexContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/oauth"
          element={
            <IndexContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                setCurrentSplitLayout,
              }}
            />
          }
        />

        {/* Legal */}
        <Route path="/legal/*" element={<Legal />} />
        <Route path="/:locale/legal/privacy/*" element={<LegalPrivacy />} />
        <Route path="/:locale/legal/terms/*" element={<LegalTerms />} />
        <Route path="/legal/privacy/*" element={<LegalPrivacy />} />
        <Route path="/legal/terms/*" element={<LegalTerms />} />

        {/* Other */}
        <Route path="/clear/*" element={<Clear />} />
        <Route path="/web_channel_example/*" element={<WebChannelExample />} />
        <Route path="/poc_deep_link/*" element={<PocDeepLink />} />
        <Route path="/poc_pair_init/*" element={<PocPairInit />} />
        <Route path="/poc_pair_start/*" element={<PocPairStart />} />
        <Route path="/cookies_disabled" element={<CookiesDisabled />} />

        {/* Post verify */}
        <Route
          path="/post_verify/third_party_auth/callback/*"
          element={
            <ThirdPartyAuthCallback
              {...{ flowQueryParams, integration, useFxAStatusResult }}
            />
          }
        />
        <Route
          path="/post_verify/set_password/*"
          element={
            <SetPasswordContainer
              {...{ flowQueryParams, integration, useFxAStatusResult }}
            />
          }
        />
        {/* Legacy URL kept alive for in-flight redirects and bookmarks from
            the third-party-auth flow; all new navigations target
            /post_verify/set_password (FXA-13475). */}
        <Route
          path="/post_verify/third_party_auth/set_password/*"
          element={
            <SetPasswordContainer
              {...{ flowQueryParams, integration, useFxAStatusResult }}
            />
          }
        />
        <Route
          path="/post_verify/service_welcome/*"
          element={<ServiceWelcome {...{ integration }} />}
        />

        {/* Reset password */}
        <Route
          path="/reset_password/*"
          element={
            <ResetPasswordContainer
              {...{ flowQueryParams, serviceName, setCurrentSplitLayout }}
            />
          }
        />
        <Route
          path="/confirm_reset_password/*"
          element={<ConfirmResetPasswordContainer {...{ integration }} />}
        />
        <Route
          path="/reset_password_totp_recovery_choice/*"
          element={<ResetPasswordRecoveryChoiceContainer />}
        />
        <Route
          path="/reset_password_recovery_phone/*"
          element={<ResetPasswordRecoveryPhoneContainer {...{ integration }} />}
        />
        <Route
          path="/confirm_totp_reset_password/*"
          element={<ConfirmTotpResetPasswordContainer />}
        />
        <Route
          path="/confirm_backup_code_reset_password/*"
          element={
            <ConfirmBackupCodeResetPasswordContainer {...{ integration }} />
          }
        />
        <Route
          path="/complete_reset_password/*"
          element={<CompleteResetPasswordContainer {...{ integration }} />}
        />
        <Route
          path="/account_recovery_reset_password/*"
          element={<CompleteResetPasswordContainer {...{ integration }} />}
        />
        <Route
          path="/account_recovery_confirm_key/*"
          element={<AccountRecoveryConfirmKeyContainer />}
        />
        <Route
          path="/reset_password_with_recovery_key_verified/*"
          element={
            <ResetPasswordWithRecoveryKeyVerifiedContainer
              {...{ integration }}
            />
          }
        />
        <Route
          path="/reset_password_verified/*"
          element={
            <ResetPasswordConfirmedContainer
              {...{ integration, serviceName }}
            />
          }
        />

        {/* Signin */}
        <Route
          path="/authorization/*"
          element={<AuthorizationContainer {...{ integration }} />}
        />
        <Route path="/report_signin/*" element={<ReportSigninContainer />} />
        <Route
          path="/oauth/force_auth/*"
          element={
            <SigninContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/force_auth/*"
          element={
            <SigninContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/oauth/signin_passwordless_code/*"
          element={
            <SigninPasswordlessCodeContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
                useFxAStatusResult,
              }}
            />
          }
        />
        <Route
          path="/signin_passwordless_code/*"
          element={
            <SigninPasswordlessCodeContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
                useFxAStatusResult,
              }}
            />
          }
        />
        <Route
          path="/oauth/signin/*"
          element={
            <SigninContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/signin/*"
          element={
            <SigninContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                isSignedIntoFirefox,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/signin_bounced/*"
          element={<SigninBounced email={localAccount?.email} />}
        />
        <Route
          path="/complete_signin/*"
          element={<CompleteSigninContainer />}
        />
        <Route
          path="/signin_confirmed/*"
          element={
            <SigninConfirmed {...{ isSignedIn, serviceName, integration }} />
          }
        />
        <Route
          path="/signin_passkey_fallback/*"
          element={
            <SigninPasskeyFallbackContainer
              {...{ integration, flowQueryParams }}
            />
          }
        />
        <Route
          path="/signin_recovery_choice/*"
          element={
            <SigninRecoveryChoiceContainer
              {...{ integration, setCurrentSplitLayout }}
            />
          }
        />
        <Route
          path="/signin_recovery_phone/*"
          element={
            <SigninRecoveryPhoneContainer
              {...{
                integration,
                setCurrentSplitLayout,
                browserSupportsKeysOptional:
                  useFxAStatusResult.browserSupportsKeysOptional,
              }}
            />
          }
        />
        <Route
          path="/signin_recovery_code/*"
          element={
            <SigninRecoveryCodeContainer
              {...{
                integration,
                setCurrentSplitLayout,
                browserSupportsKeysOptional:
                  useFxAStatusResult.browserSupportsKeysOptional,
              }}
            />
          }
        />
        <Route path="/signin_reported/*" element={<SigninReported />} />
        <Route
          path="/signin_token_code/*"
          element={
            <SigninTokenCodeContainer
              {...{ integration, setCurrentSplitLayout }}
            />
          }
        />
        <Route
          path="/signin_totp_code/*"
          element={
            <SigninTotpCodeContainer
              {...{
                integration,
                serviceName,
                setCurrentSplitLayout,
                useFxAStatusResult,
              }}
            />
          }
        />
        <Route
          path="/signin_verified/*"
          element={
            <SigninConfirmed {...{ isSignedIn, serviceName, integration }} />
          }
        />
        <Route
          path="/signin_unblock/*"
          element={
            <SigninUnblockContainer
              {...{
                integration,
                flowQueryParams,
                setCurrentSplitLayout,
                useFxAStatusResult,
              }}
            />
          }
        />
        <Route
          path="/inline_recovery_key_setup/*"
          element={
            <InlineRecoveryKeySetupContainer
              cmsInfo={integration.getCmsInfo()}
            />
          }
        />

        {/* Signup */}
        <Route
          path="/confirm_signup_code/*"
          element={
            <ConfirmSignupCodeContainer
              {...{ integration, flowQueryParams, setCurrentSplitLayout }}
            />
          }
        />
        <Route
          path="/oauth/signup/*"
          element={
            <SignupContainer
              {...{
                integration,
                serviceName,
                flowQueryParams,
                useFxAStatusResult,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/primary_email_verified/*"
          element={
            <PrimaryEmailVerified
              {...{ isSignedIn, serviceName, integration }}
            />
          }
        />
        <Route
          path="/signup/*"
          element={
            <SignupContainer
              {...{
                integration,
                flowQueryParams,
                useFxAStatusResult,
                setCurrentSplitLayout,
              }}
            />
          }
        />
        <Route
          path="/signup_confirmed/*"
          element={<SignupConfirmed {...{ isSignedIn, serviceName }} />}
        />
        <Route
          path="/signup_confirmed_sync/*"
          element={
            <SignupConfirmedSync
              offeredSyncEngines={useFxAStatusResult.offeredSyncEngines}
              {...{ integration, setCurrentSplitLayout }}
            />
          }
        />
        <Route
          path="/signup_verified/*"
          element={<SignupConfirmed {...{ isSignedIn, serviceName }} />}
        />

        <Route
          path="/inline_totp_setup/*"
          element={
            <InlineTotpSetupContainer
              integration={integration}
              {...{ isSignedIn, serviceName, flowQueryParams }}
            />
          }
        />
        <Route
          path="/inline_recovery_setup/*"
          element={
            <InlineRecoverySetupContainer
              integration={integration}
              {...{ isSignedIn, serviceName }}
            />
          }
        />

        {/* Pairing */}
        <Route
          path="/connect_another_device/*"
          element={<ConnectAnotherDevice />}
        />
        <Route
          path="/pair/supp/allow/*"
          element={<PairSuppAllow integration={integration} />}
        />
        <Route
          path="/pair/supp/wait_for_auth/*"
          element={<PairSuppWaitForAuth integration={integration} />}
        />
        <Route path="/pair/supp/complete/*" element={<PairSuccess />} />
        <Route
          path="/pair/supp/*"
          element={<PairSupp integration={integration} />}
        />
        <Route
          path="/pair/auth/allow/*"
          element={<PairAuthAllow integration={integration} />}
        />
        <Route
          path="/pair/auth/wait_for_supp/*"
          element={<PairAuthWaitForSupp integration={integration} />}
        />
        <Route
          path="/pair/auth/complete/*"
          element={<PairAuthComplete integration={integration} />}
        />
        <Route
          path="/pair/auth/totp/*"
          element={<PairAuthTotp integration={integration} />}
        />
        <Route path="/pair/failure/*" element={<PairFailure />} />
        <Route path="/pair/unsupported/*" element={<PairUnsupported />} />
        <Route
          path="/pair/*"
          element={<PairIndex integration={integration} />}
        />
        <Route path="/oauth/success/:clientId/*" element={<PairSuccess />} />
      </Routes>
      {/* This must be placed after the routes so it's rendered at the bottom of the DOM. */}
      <PromoQrMobile
        integration={integration}
        promoQrImageUrl={defaultCmsState.data?.defaultCms?.promoQrImageUrl}
      />
    </>
  );
};

export default App;
