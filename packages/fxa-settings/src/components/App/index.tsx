/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, Router, useLocation } from '@reach/router';
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useLayoutEffect,
  useMemo,
} from 'react';

import { QueryParams } from '../..';
import { storeAccountData } from '../../lib/storage-utils';
import { currentAccount, getAccountByUid } from '../../lib/cache';
import { firefox } from '../../lib/channels/firefox';
import * as MetricsFlow from '../../lib/metrics-flow';
import GleanMetrics from '../../lib/glean';
import * as Metrics from '../../lib/metrics';
import { MozServices } from '../../lib/types';

import {
  Integration,
  useConfig,
  useInitialMetricsQueryState,
  useIntegration,
  useLocalSignedInQueryState,
  useSession,
} from '../../models';
import {
  initializeSettingsContext,
  SettingsContext,
} from '../../models/contexts/SettingsContext';

import { hardNavigate } from 'fxa-react/lib/utils';

import sentryMetrics from 'fxa-shared/sentry/browser';

// Components
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { ScrollToTop } from '../Settings/ScrollToTop';

// Pages
import CannotCreateAccount from '../../pages/CannotCreateAccount';
import Clear from '../../pages/Clear';
import InlineRecoverySetupContainer from '../../pages/InlineRecoverySetup/container';
import InlineTotpSetupContainer from '../../pages/InlineTotpSetup/container';
import Legal from '../../pages/Legal';
import LegalPrivacy from '../../pages/Legal/Privacy';
import LegalTerms from '../../pages/Legal/Terms';
import ThirdPartyAuthCallback from '../../pages/PostVerify/ThirdPartyAuthCallback';
import ResetPasswordContainer from '../../pages/ResetPassword/ResetPassword/container';
import ConfirmResetPasswordContainer from '../../pages/ResetPassword/ConfirmResetPassword/container';
import CompleteResetPasswordContainer from '../../pages/ResetPassword/CompleteResetPassword/container';
import AccountRecoveryConfirmKeyContainer from '../../pages/ResetPassword/AccountRecoveryConfirmKey/container';
import ConfirmTotpResetPasswordContainer from '../../pages/ResetPassword/ConfirmTotpResetPassword/container';
import ResetPasswordConfirmedContainer from '../../pages/ResetPassword/ResetPasswordConfirmed/container';
import ResetPasswordWithRecoveryKeyVerifiedContainer from '../../pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified/container';
import CompleteSigninContainer from '../../pages/Signin/CompleteSignin/container';
import SigninContainer from '../../pages/Signin/container';
import ReportSigninContainer from '../../pages/Signin/ReportSignin/container';
import SigninBounced from '../../pages/Signin/SigninBounced';
import SigninConfirmed from '../../pages/Signin/SigninConfirmed';
import SigninRecoveryCodeContainer from '../../pages/Signin/SigninRecoveryCode/container';
import SigninReported from '../../pages/Signin/SigninReported';
import SigninTokenCodeContainer from '../../pages/Signin/SigninTokenCode/container';
import SigninTotpCodeContainer from '../../pages/Signin/SigninTotpCode/container';
import SigninPushCodeContainer from '../../pages/Signin/SigninPushCode/container';
import SigninPushCodeConfirmContainer from '../../pages/Signin/SigninPushCodeConfirm/container';
import SigninUnblockContainer from '../../pages/Signin/SigninUnblock/container';
import ConfirmSignupCodeContainer from '../../pages/Signup/ConfirmSignupCode/container';
import SignupContainer from '../../pages/Signup/container';
import PrimaryEmailVerified from '../../pages/Signup/PrimaryEmailVerified';
import SignupConfirmed from '../../pages/Signup/SignupConfirmed';
import WebChannelExample from '../../pages/WebChannelExample';
import SignoutSync from '../Settings/SignoutSync';
import InlineRecoveryKeySetupContainer from '../../pages/InlineRecoveryKeySetup/container';
import SetPasswordContainer from '../../pages/PostVerify/SetPassword/container';
import SigninRecoveryChoiceContainer from '../../pages/Signin/SigninRecoveryChoice/container';
import SigninRecoveryPhoneContainer from '../../pages/Signin/SigninRecoveryPhone/container';
import { IndexContainer } from '../../pages/Index/container';
import AuthorizationContainer from '../../pages/Authorization/container';
import CookiesDisabled from '../../pages/CookiesDisabled';

const Settings = lazy(() => import('../Settings'));

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
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

  // GQL call for minimal metrics data
  const { loading: metricsLoading, data } = useInitialMetricsQueryState() ?? {};

  // Determine if user is actually signed in
  const [isSignedIn, setIsSignedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const initializeSession = async () => {
      if (!integration) {
        return;
      }

      // If the local apollo cache says we are signed in, then we can skip the rest.
      if (isSignedInData?.isSignedIn === true) {
        setIsSignedIn(true);
        return;
      }

      // if there is already a valid current account, use it
      const localUser = currentAccount();
      if (
        localUser?.sessionToken &&
        (await session.isValid(localUser.sessionToken))
      ) {
        setIsSignedIn(true);
        return;
      }

      let isValidSession = false;

      // Request and update account data/state to match the browser state.
      // If there is a user actively signed into the browser,
      // we should try to use that user's account when possible.
      const ua = navigator.userAgent.toLowerCase();
      // This may not catch all Firefox browsers notably iOS devices, see FXA-11520 for alternate approach
      const isProbablyFirefox = ua.includes('firefox') || ua.includes('fxios');

      let userFromBrowser;
      if (isProbablyFirefox) {
        userFromBrowser = await firefox.requestSignedInUser(
          integration.data.context || '',
          // TODO with React pairing flow, update this if pairing flow
          false,
          integration.data.service || ''
        );
      }

      if (userFromBrowser?.sessionToken) {
        // If the session is valid, try to set it as the current account
        isValidSession = await session.isValid(userFromBrowser.sessionToken);
        if (isValidSession) {
          const cachedUser = getAccountByUid(userFromBrowser.uid);
          storeAccountData(
            cachedUser
              ? {
                  ...cachedUser,
                  // Make sure we are apply the session token we validated
                  sessionToken: userFromBrowser.sessionToken,
                }
              : userFromBrowser
          );
        }
      }

      setIsSignedIn(isValidSession);
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
        recoveryKey: data.account.recoveryKey.exists,
        hasSecondaryVerifiedEmail:
          data.account.emails.length > 1 && data.account.emails[1].verified,
        totpActive: data.account.totp.exists && data.account.totp.verified,
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

  // Wait until app initialization is complete
  if (
    metricsLoading ||
    !integration ||
    isSignedIn === undefined ||
    metricsEnabled === undefined
  ) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router basepath="/">
      <AuthAndAccountSetupRoutes
        {...{
          isSignedIn,
          integration,
          flowQueryParams: updatedFlowQueryParams,
        }}
        path="/*"
      />
      <SettingsRoutes {...{ isSignedIn, integration }} path="/settings/*" />
    </Router>
  );
};

const SettingsRoutes = ({
  isSignedIn,
  integration,
}: { isSignedIn: boolean; integration: Integration } & RouteComponentProps) => {
  const location = useLocation();
  const isSync = integration != null ? integration.isSync() : false;

  // If the user is not signed in, they cannot access settings! Direct them accordingly
  if (!isSignedIn) {
    const params = new URLSearchParams(window.location.search);

    if (isSync) {
      // For sync this means we somehow dropped the sign out message, which is
      // a known issue in android. In this case, our best option is to ask the
      // user to manually signout from sync.
      return <SignoutSync />;
    } else {
      // For regular RP / web logins, maybe the session token expired. In this
      // case we just send them to the root.
      params.set('redirect_to', location.pathname);
      hardNavigate(`/?${params.toString()}`);
    }

    return <LoadingSpinner fullScreen />;
  }

  const settingsContext = initializeSettingsContext();
  return (
    <SettingsContext.Provider value={settingsContext}>
      <ScrollToTop default>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Settings path="/settings/*" {...{ integration }} />
        </Suspense>
      </ScrollToTop>
    </SettingsContext.Provider>
  );
};

const AuthAndAccountSetupRoutes = ({
  isSignedIn,
  integration,
  flowQueryParams,
}: {
  isSignedIn: boolean;
  integration: Integration;
  flowQueryParams: QueryParams;
} & RouteComponentProps) => {
  const localAccount = currentAccount();
  // TODO: MozServices / string discrepancy, FXA-6802
  const serviceName = integration.getServiceName() as MozServices;
  const location = useLocation();
  const { enabled: gleanEnabled } = GleanMetrics.useGlean();

  useEffect(() => {
    gleanEnabled && GleanMetrics.pageLoad(location.pathname);
  }, [location.pathname, gleanEnabled]);

  return (
    <Router>
      {/* Index */}
      <IndexContainer path="/" {...{ integration, serviceName, flowQueryParams }} />
      <IndexContainer path="/oauth" {...{ integration, serviceName, flowQueryParams }} />

      {/* Legal */}
      <Legal path="/legal/*" />
      <LegalPrivacy path="/:locale/legal/privacy/*" />
      <LegalTerms path="/:locale/legal/terms/*" />
      <LegalPrivacy path="/legal/privacy/*" />
      <LegalTerms path="/legal/terms/*" />

      {/* Other */}
      <Clear path="/clear/*" />
      <WebChannelExample path="/web_channel_example/*" />
      <CookiesDisabled path="cookies_disabled" />

      {/* Post verify */}
      <ThirdPartyAuthCallback
        path="/post_verify/third_party_auth/callback/*"
        {...{ flowQueryParams, integration }}
      />
      <SetPasswordContainer
        path="/post_verify/third_party_auth/set_password/*"
        {...{ flowQueryParams, integration }}
      />

      {/* Reset password */}
      <ResetPasswordContainer
        path="/reset_password/*"
        {...{ flowQueryParams, serviceName }}
      />
      <ConfirmResetPasswordContainer path="/confirm_reset_password/*" />
      <ConfirmTotpResetPasswordContainer path="/confirm_totp_reset_password/*" />
      <CompleteResetPasswordContainer
        path="/complete_reset_password/*"
        {...{ integration }}
      />
      <CompleteResetPasswordContainer
        path="/account_recovery_reset_password/*"
        {...{ integration }}
      />
      <AccountRecoveryConfirmKeyContainer
        path="/account_recovery_confirm_key/*"
        {...{
          serviceName,
        }}
      />
      <ResetPasswordWithRecoveryKeyVerifiedContainer
        path="/reset_password_with_recovery_key_verified/*"
        {...{ integration }}
      />
      <ResetPasswordConfirmedContainer
        path="/reset_password_verified/*"
        {...{ integration, serviceName }}
      />

      {/* Signin */}
      <AuthorizationContainer path="/authorization/*" {...{ integration }} />
      <ReportSigninContainer path="/report_signin/*" />
      <SigninContainer
        path="/oauth/force_auth/*"
        {...{ integration, serviceName, flowQueryParams }}
      />
      <SigninContainer
        path="/force_auth/*"
        {...{ integration, serviceName, flowQueryParams }}
      />
      <SigninContainer
        path="/oauth/signin/*"
        {...{ integration, serviceName, flowQueryParams }}
      />
      <SigninContainer
        path="/signin/*"
        {...{ integration, serviceName, flowQueryParams }}
      />
      <SigninBounced email={localAccount?.email} path="/signin_bounced/*" />
      <CompleteSigninContainer path="/complete_signin/*" />
      <SigninConfirmed
        path="/signin_confirmed/*"
        {...{ isSignedIn, serviceName }}
      />
      <SigninRecoveryChoiceContainer path="/signin_recovery_choice/*" />
      <SigninRecoveryPhoneContainer
        path="/signin_recovery_phone/*"
        {...{ integration }}
      />
      <SigninRecoveryCodeContainer
        path="/signin_recovery_code/*"
        {...{ integration }}
      />
      <SigninReported path="/signin_reported/*" />
      <SigninTokenCodeContainer
        path="/signin_token_code/*"
        {...{ integration }}
      />
      <SigninTotpCodeContainer
        path="/signin_totp_code/*"
        {...{ integration, serviceName }}
      />
      <SigninPushCodeContainer
        path="/signin_push_code/*"
        {...{ integration, serviceName }}
      />
      <SigninPushCodeConfirmContainer
        path="/signin_push_code_confirm/*"
        {...{ integration, serviceName }}
      />
      <SigninConfirmed
        path="/signin_verified/*"
        {...{ isSignedIn, serviceName }}
      />
      <SigninUnblockContainer
        path="/signin_unblock/*"
        {...{ integration, flowQueryParams }}
      />
      <InlineRecoveryKeySetupContainer path="/inline_recovery_key_setup/*" />

      {/* Signup */}
      <CannotCreateAccount path="/cannot_create_account/*" />
      <ConfirmSignupCodeContainer
        path="/confirm_signup_code/*"
        {...{ integration, flowQueryParams }}
      />
      <SignupContainer
        path="/oauth/signup/*"
        {...{ integration, serviceName, flowQueryParams }}
      />
      <PrimaryEmailVerified
        path="/primary_email_verified/*"
        {...{ isSignedIn, serviceName }}
      />
      <SignupContainer
        path="/signup/*"
        {...{ integration, serviceName, flowQueryParams }}
      />
      <SignupConfirmed
        path="/signup_confirmed/*"
        {...{ isSignedIn, serviceName }}
      />
      <SignupConfirmed
        path="/signup_verified/*"
        {...{ isSignedIn, serviceName }}
      />

      <InlineTotpSetupContainer
        path="/inline_totp_setup/*"
        integration={integration}
        {...{ isSignedIn, serviceName, flowQueryParams }}
      />

      <InlineRecoverySetupContainer
        path="/inline_recovery_setup/*"
        integration={integration}
        {...{ isSignedIn, serviceName }}
      />
    </Router>
  );
};

export default App;
