/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { RouteComponentProps, Router, useLocation } from '@reach/router';
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

import { QueryParams } from '../..';

import { currentAccount } from '../../lib/cache';
import { firefox } from '../../lib/channels/firefox';
import GleanMetrics from '../../lib/glean';
import * as Metrics from '../../lib/metrics';
import { LinkType, MozServices } from '../../lib/types';

import {
  Integration,
  isWebIntegration,
  OAuthIntegration,
  useConfig,
  useInitialMetricsQueryState,
  useIntegration,
  useLocalSignedInQueryState,
} from '../../models';
import {
  initializeSettingsContext,
  SettingsContext,
} from '../../models/contexts/SettingsContext';
import { CreateCompleteResetPasswordLink } from '../../models/reset-password/verification/factory';

import { hardNavigate } from 'fxa-react/lib/utils';

import sentryMetrics from 'fxa-shared/sentry/browser';

// Components
import LoadingSpinner from 'fxa-react/components/LoadingSpinner';
import { ScrollToTop } from '../Settings/ScrollToTop';

// Pages
import CannotCreateAccount from '../../pages/CannotCreateAccount';
import Clear from '../../pages/Clear';
import CookiesDisabled from '../../pages/CookiesDisabled';
import InlineRecoverySetupContainer from '../../pages/InlineRecoverySetup/container';
import InlineTotpSetupContainer from '../../pages/InlineTotpSetup/container';
import Legal from '../../pages/Legal';
import LegalPrivacy from '../../pages/Legal/Privacy';
import LegalTerms from '../../pages/Legal/Terms';
import ThirdPartyAuthCallback from '../../pages/PostVerify/ThirdPartyAuthCallback';
import ResetPassword from '../../pages/ResetPassword';
import AccountRecoveryConfirmKey from '../../pages/ResetPassword/AccountRecoveryConfirmKey';
import AccountRecoveryResetPasswordContainer from '../../pages/ResetPassword/AccountRecoveryResetPassword/container';
import CompleteResetPasswordContainer from '../../pages/ResetPassword/CompleteResetPassword/container';
import ConfirmResetPassword from '../../pages/ResetPassword/ConfirmResetPassword';
import ResetPasswordConfirmed from '../../pages/ResetPassword/ResetPasswordConfirmed';
import ResetPasswordWithRecoveryKeyVerified from '../../pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified';
import CompleteSigninContainer from '../../pages/Signin/CompleteSignin/container';
import SigninContainer from '../../pages/Signin/container';
import ReportSigninContainer from '../../pages/Signin/ReportSignin/container';
import SigninBounced from '../../pages/Signin/SigninBounced';
import SigninConfirmed from '../../pages/Signin/SigninConfirmed';
import SigninRecoveryCodeContainer from '../../pages/Signin/SigninRecoveryCode/container';
import SigninReported from '../../pages/Signin/SigninReported';
import SigninTokenCodeContainer from '../../pages/Signin/SigninTokenCode/container';
import SigninTotpCodeContainer from '../../pages/Signin/SigninTotpCode/container';
import SigninUnblockContainer from '../../pages/Signin/SigninUnblock/container';
import ConfirmSignupCodeContainer from '../../pages/Signup/ConfirmSignupCode/container';
import SignupContainer from '../../pages/Signup/container';
import PrimaryEmailVerified from '../../pages/Signup/PrimaryEmailVerified';
import SignupConfirmed from '../../pages/Signup/SignupConfirmed';
import WebChannelExample from '../../pages/WebChannelExample';
import LinkValidator from '../LinkValidator';
import ResetPasswordContainer from '../../pages/ResetPasswordRedesign/ResetPassword/container';
import ConfirmResetPasswordContainer from '../../pages/ResetPasswordRedesign/ConfirmResetPassword/container';
import CompleteResetPasswordWithCodeContainer from '../../pages/ResetPasswordRedesign/CompleteResetPassword/container';
import AccountRecoveryConfirmKeyContainer from '../../pages/ResetPasswordRedesign/AccountRecoveryConfirmKey/container';

const Settings = lazy(() => import('../Settings'));

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const config = useConfig();

  // GQL call for minimal metrics data
  const { loading: metricsLoading, data } = useInitialMetricsQueryState() ?? {};

  // Because this query depends on the result of an initial query (in this case,
  // metrics), we need to run it separately.
  const { data: isSignedInData } = useLocalSignedInQueryState();
  const integration = useIntegration();

  const isSignedIn = isSignedInData?.isSignedIn;

  const getMetricsEnabled = useCallback(() => {
    if (metricsLoading || !integration || isSignedIn === undefined) {
      return;
    }
    return data?.account?.metricsEnabled || !isSignedIn;
  }, [metricsLoading, integration, isSignedIn, data?.account?.metricsEnabled]);
  const metricsEnabled = getMetricsEnabled();

  useMemo(() => {
    if (!metricsEnabled || !integration || GleanMetrics.getEnabled()) {
      return;
    }

    GleanMetrics.initialize(
      {
        ...config.glean,
        enabled: metricsEnabled,
        appDisplayVersion: config.version,
        channel: config.glean.channel,
      },
      {
        flowQueryParams,
        account: {
          metricsEnabled: data?.account?.metricsEnabled,
          uid: data?.account?.uid,
        },
        userAgent: navigator.userAgent,
        integration,
      }
    );
  }, [
    config.glean,
    config.version,
    data?.account?.metricsEnabled,
    data?.account?.uid,
    flowQueryParams,
    integration,
    metricsEnabled,
  ]);

  useEffect(() => {
    if (!metricsEnabled) {
      return;
    }
    Metrics.init(metricsEnabled, flowQueryParams);
    if (data?.account?.metricsEnabled) {
      Metrics.initUserPreferences({
        recoveryKey: data.account.recoveryKey,
        hasSecondaryVerifiedEmail:
          data.account.emails.length > 1 && data.account.emails[1].verified,
        totpActive: data.account.totp.exists && data.account.totp.verified,
      });
    }
  }, [
    data,
    data?.account?.metricsEnabled,
    data?.account?.emails,
    data?.account?.totp,
    data?.account?.recoveryKey,
    isSignedIn,
    flowQueryParams,
    config,
    metricsLoading,
    metricsEnabled,
  ]);

  useEffect(() => {
    if (metricsEnabled) {
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

  // Wait until metrics is done loading, integration has been created, and isSignedIn has been determined.
  if (metricsLoading || !integration || isSignedIn === undefined) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Router basepath="/">
      <AuthAndAccountSetupRoutes
        {...{ isSignedIn, integration, flowQueryParams }}
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
  // TODO: Remove this + config.sendFxAStatusOnSettings check once we confirm this works
  const config = useConfig();

  // Request and update account data/state to match the browser state because:
  // 1) If a user logs in through the browser Sync pairing flow and then accesses
  // Settings through the browser, they'd have to login again (isSignedIn === false).
  // 2) If a user disconnects their account through Sync and then logs into another account
  // using the pairing flow, we hold onto the old session token (isSignedIn === true).
  const [shouldCheckFxaStatus, setShouldCheckFxaStatus] = useState(
    // See note above WebIntegration's `isSync` check
    isWebIntegration(integration) &&
      integration.isSync() &&
      config.sendFxAStatusOnSettings
  );
  useEffect(() => {
    (async () => {
      if (shouldCheckFxaStatus) {
        await firefox.requestSignedInUser(integration.data.context);
        setShouldCheckFxaStatus(false);
      }
    })();
  });

  if (!isSignedIn && !shouldCheckFxaStatus) {
    const params = new URLSearchParams(location.search);
    params.set('redirect_to', location.pathname);
    const path = `/?${params.toString()}`;
    hardNavigate(path);
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
  const config = useConfig();
  const localAccount = currentAccount();
  // TODO: MozServices / string discrepancy, FXA-6802
  const serviceName = integration.getServiceName() as MozServices;

  return (
    <Router>
      {/* Legal */}
      <Legal path="/legal/*" />
      <LegalPrivacy path="/:locale/legal/privacy/*" />
      <LegalTerms path="/:locale/legal/terms/*" />
      <LegalPrivacy path="/legal/privacy/*" />
      <LegalTerms path="/legal/terms/*" />

      {/* Other */}
      <Clear path="/clear/*" />
      <CookiesDisabled path="/cookies_disabled/*" />
      <WebChannelExample path="/web_channel_example/*" />

      {/* Post verify */}
      <ThirdPartyAuthCallback
        path="/post_verify/third_party_auth/callback/*"
        {...{ flowQueryParams }}
      />

      {/* Reset password */}
      {config.featureFlags?.resetPasswordWithCode === true ? (
        <>
          <ResetPasswordContainer
            path="/reset_password/*"
            {...{ flowQueryParams, serviceName }}
          />
          <ConfirmResetPasswordContainer path="/confirm_reset_password/*" />
          <CompleteResetPasswordWithCodeContainer
            path="/complete_reset_password/*"
            {...{ integration }}
          />
          <CompleteResetPasswordWithCodeContainer
            path="/account_recovery_reset_password/*"
            {...{ integration }}
          />
          <AccountRecoveryConfirmKeyContainer
            path="/account_recovery_confirm_key/*"
            {...{
              serviceName,
            }}
          />
        </>
      ) : (
        <>
          <ResetPassword
            path="/reset_password/*"
            {...{ integration, flowQueryParams }}
          />
          <ConfirmResetPassword
            path="/confirm_reset_password/*"
            {...{ integration }}
          />
          <CompleteResetPasswordContainer
            path="/complete_reset_password/*"
            {...{ integration }}
          />
          <LinkValidator
            path="/account_recovery_confirm_key/*"
            linkType={LinkType['reset-password']}
            viewName="account-recovery-confirm-key"
            createLinkModel={() => {
              return CreateCompleteResetPasswordLink();
            }}
            {...{ integration }}
          >
            {({ setLinkStatus, linkModel }) => (
              <AccountRecoveryConfirmKey
                {...{
                  setLinkStatus,
                  linkModel,
                  integration,
                }}
              />
            )}
          </LinkValidator>
          <AccountRecoveryResetPasswordContainer
            path="/account_recovery_reset_password/*"
            {...{ integration }}
          />
        </>
      )}

      <ResetPasswordWithRecoveryKeyVerified
        path="/reset_password_with_recovery_key_verified/*"
        {...{ integration, isSignedIn }}
      />
      <ResetPasswordConfirmed
        path="/reset_password_verified/*"
        {...{ isSignedIn, serviceName }}
      />

      {/* Signin */}
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
      <SigninRecoveryCodeContainer
        path="/signin_recovery_code/*"
        {...{ integration, serviceName }}
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
      <SigninConfirmed
        path="/signin_verified/*"
        {...{ isSignedIn, serviceName }}
      />
      <SigninUnblockContainer
        path="/signin_unblock/*"
        {...{ integration, flowQueryParams }}
      />

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
        integration={integration as OAuthIntegration}
        {...{ isSignedIn, serviceName, flowQueryParams }}
      />
      <InlineRecoverySetupContainer
        path="/inline_recovery_setup/*"
        integration={integration as OAuthIntegration}
        {...{ isSignedIn, serviceName }}
      />
    </Router>
  );
};

export default App;
