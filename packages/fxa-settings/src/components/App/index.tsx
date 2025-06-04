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
const IndexContainer = lazy(() => import('../../pages/Index/container'));
const CannotCreateAccount = lazy(
  () => import('../../pages/CannotCreateAccount')
);
const Clear = lazy(() => import('../../pages/Clear'));
const InlineRecoverySetupContainer = lazy(
  () => import('../../pages/InlineRecoverySetup/container')
);
const InlineTotpSetupContainer = lazy(
  () => import('../../pages/InlineTotpSetup/container')
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
const SigninRecoveryCodeContainer = lazy(
  () => import('../../pages/Signin/SigninRecoveryCode/container')
);
const SigninReported = lazy(() => import('../../pages/Signin/SigninReported'));
const SigninTokenCodeContainer = lazy(
  () => import('../../pages/Signin/SigninTokenCode/container')
);
const SigninTotpCodeContainer = lazy(
  () => import('../../pages/Signin/SigninTotpCode/container')
);
const SigninPushCodeContainer = lazy(
  () => import('../../pages/Signin/SigninPushCode/container')
);
const SigninPushCodeConfirmContainer = lazy(
  () => import('../../pages/Signin/SigninPushCodeConfirm/container')
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

const AuthorizationContainer = lazy(
  () => import('../../pages/Authorization/container')
);
const CookiesDisabled = lazy(() => import('../../pages/CookiesDisabled'));
const ResetPasswordRecoveryChoiceContainer = lazy(
  () =>
    import('../../pages/ResetPassword/ResetPasswordRecoveryChoice/container')
);
const ResetPasswordRecoveryPhoneContainer = lazy(
  () =>
    import('../../pages/ResetPassword/ResetPasswordRecoveryPhone/container')
);

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
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Router>
        {/* Index */}
        <IndexContainer
          path="/"
          {...{ integration, serviceName, flowQueryParams }}
        />
        <IndexContainer
          path="/oauth"
          {...{ integration, serviceName, flowQueryParams }}
        />

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
      <ResetPasswordRecoveryChoiceContainer path="/reset_password_totp_recovery_choice/*" />
      <ResetPasswordRecoveryPhoneContainer path="/reset_password_recovery_phone/*"
                                           {...{ integration }}
      />
      <ConfirmTotpResetPasswordContainer path="/confirm_totp_reset_password/*" />
      <ConfirmBackupCodeResetPasswordContainer path="/confirm_backup_code_reset_password/*" />
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
          {...{ integration, serviceName, flowQueryParams }}
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
    </Suspense>
  );
};

export default App;
