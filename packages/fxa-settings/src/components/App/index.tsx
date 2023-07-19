/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { ScrollToTop } from '../Settings/ScrollToTop';
import { sessionToken } from '../../lib/cache';
import { useInitialState, useAccount, useConfig } from '../../models';
import * as Metrics from '../../lib/metrics';
import Storage from '../../lib/storage';

import sentryMetrics from 'fxa-shared/lib/sentry';

import { PageWithLoggedInStatusState } from '../PageWithLoggedInStatusState';
import Settings from '../Settings';
import { QueryParams } from '../..';
import CannotCreateAccount from '../../pages/CannotCreateAccount';
import Clear from '../../pages/Clear';
import CookiesDisabled from '../../pages/CookiesDisabled';
import ResetPassword from '../../pages/ResetPassword';
import ConfirmResetPassword from '../../pages/ResetPassword/ConfirmResetPassword';

import ResetPasswordWithRecoveryKeyVerified from '../../pages/ResetPassword/ResetPasswordWithRecoveryKeyVerified';
import Legal from '../../pages/Legal';
import LegalTerms from '../../pages/Legal/Terms';
import LegalPrivacy from '../../pages/Legal/Privacy';

import PrimaryEmailVerified from '../../pages/Signup/PrimaryEmailVerified';

import CompleteResetPassword from '../../pages/ResetPassword/CompleteResetPassword';
import ResetPasswordConfirmed from '../../pages/ResetPassword/ResetPasswordConfirmed';
import AccountRecoveryConfirmKey from '../../pages/ResetPassword/AccountRecoveryConfirmKey';

import SigninConfirmed from '../../pages/Signin/SigninConfirmed';

import SignupConfirmed from '../../pages/Signup/SignupConfirmed';
import ConfirmSignupCode from '../../pages/Signup/ConfirmSignupCode';
import SigninReported from '../../pages/Signin/SigninReported';
import SigninBounced from '../../pages/Signin/SigninBounced';
import AccountRecoveryResetPassword from '../../pages/ResetPassword/AccountRecoveryResetPassword';
import LinkValidator from '../LinkValidator';
import { LinkType } from 'fxa-settings/src/lib/types';
import Confirm from 'fxa-settings/src/pages/Signup/Confirm';
import WebChannelExample from '../../pages/WebChannelExample';
import { CreateCompleteResetPasswordLink } from '../../models/reset-password/verification/factory';
import ThirdPartyAuthCallback from '../../pages/PostVerify/ThirdPartyAuthCallback';

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>();

  const { showReactApp, isInRecoveryKeyExperiment } = flowQueryParams;
  const { loading, error } = useInitialState();
  const account = useAccount();
  const [email, setEmail] = useState<string>();
  const [emailLookupComplete, setEmailLookupComplete] =
    useState<boolean>(false);

  const config = useConfig();
  const sessionTokenId = sessionToken();

  const { metricsEnabled } = account;

  // TODO Remove feature flag and experiment logic in FXA-7419
  const showRecoveryKeyV2 = !!(
    config.showRecoveryKeyV2 && isInRecoveryKeyExperiment === 'true'
  );

  useEffect(() => {
    Metrics.init(metricsEnabled || !isSignedIn, flowQueryParams);
    if (metricsEnabled) {
      Metrics.initUserPreferences(account);
    }
  }, [account, metricsEnabled, isSignedIn, flowQueryParams]);

  useEffect(() => {
    if (!loading && error?.message.includes('Invalid token')) {
      setIsSignedIn(false);
    } else if (!loading && !error) {
      setIsSignedIn(true);
    }
  }, [error, loading]);

  useEffect(() => {
    if (!loading) {
      // Previously, when Sentry was just loaded in Settings, we only enabled
      // Sentry once we know the user's metrics preferences (and of course,
      // only when the user was logged in, since all users in Settings are.)
      // Now we enable Sentry for logged out users, and for logged in users
      // who opt to have metrics enabled.
      // A bit of chicken and egg but it could be possible that we miss some
      // errors while the page is loading and user is being fetched.
      if (metricsEnabled || !isSignedIn) {
        sentryMetrics.configure({
          release: config.version,
          sentry: {
            ...config.sentry,
          },
        });
      } else {
        sentryMetrics.disable();
      }
    }
  }, [metricsEnabled, config.sentry, config.version, loading, isSignedIn]);

  useEffect(() => {
    if (Storage.isLocalStorageEnabled(window)) {
      let uniqueUserId = JSON.parse(
        localStorage.getItem('__fxa_storage.currentAccountUid') || '{}'
      );

      const accounts: Array<{ email: string; uid: string }> = JSON.parse(
        localStorage.getItem('__fxa_storage.accounts') || '{}'
      );

      const currentUser = Object.values(accounts).find(
        (x) => x.uid === uniqueUserId
      );

      if (currentUser) {
        setEmail(currentUser.email);
      }
      setEmailLookupComplete(true);
    }
  }, [setEmail, email, setEmailLookupComplete]);

  return (
    <>
      <Router basepath={'/'}>
        <ScrollToTop default>
          {/* We probably don't need a guard here with `showReactApp` or a feature flag/config
           * check since users will be served the Backbone version of pages if either of those
           * are false, but guard with query param anyway since we have it handy */}
          {showReactApp && (
            <>
              <CannotCreateAccount path="/cannot_create_account/*" />
              <Clear path="/clear/*" />
              <CookiesDisabled path="/cookies_disabled/*" />

              <Legal path="/legal/*" />
              <LegalTerms path="/legal/terms/*" />
              <LegalTerms path="/:locale/legal/terms/*" />
              <LegalPrivacy path="/legal/privacy/*" />
              <LegalPrivacy path="/:locale/legal/privacy/*" />

              <ResetPassword path="/reset_password/*" />
              <ConfirmResetPassword path="/confirm_reset_password/*" />

              <WebChannelExample path="/web_channel_example/*" />

              <LinkValidator
                path="/complete_reset_password/*"
                linkType={LinkType['reset-password']}
                viewName="complete-reset-password"
                getParamsFromModel={() => {
                  return CreateCompleteResetPasswordLink();
                }}
              >
                {({ setLinkStatus, params }) => (
                  <CompleteResetPassword
                    {...{
                      setLinkStatus,
                      params,
                    }}
                  />
                )}
              </LinkValidator>

              <LinkValidator
                path="/account_recovery_confirm_key/*"
                linkType={LinkType['reset-password']}
                viewName="account-recovery-confirm-key"
                getParamsFromModel={() => {
                  return CreateCompleteResetPasswordLink();
                }}
              >
                {({ setLinkStatus, params }) => (
                  <AccountRecoveryConfirmKey
                    {...{
                      setLinkStatus,
                      params,
                    }}
                  />
                )}
              </LinkValidator>

              <AccountRecoveryResetPassword path="/account_recovery_reset_password/*" />

              <SigninReported path="/signin_reported/*" />
              <SigninBounced
                {...{ emailLookupComplete, email }}
                path="/signin_bounced/*"
              />
              {/* Pages using the Ready view need to be accessible to logged out viewers,
               * but need to be able to check if the user is logged in or logged out,
               * so they are wrapped in this component.
               */}
              <PageWithLoggedInStatusState
                Page={ResetPasswordConfirmed}
                path="/reset_password_verified/*"
              />
              <PageWithLoggedInStatusState
                Page={ResetPasswordWithRecoveryKeyVerified}
                path="/reset_password_with_recovery_key_verified/*"
              />
              <PageWithLoggedInStatusState
                Page={PrimaryEmailVerified}
                path="/primary_email_verified/*"
              />
              <PageWithLoggedInStatusState
                Page={SignupConfirmed}
                path="/signup_verified/*"
              />
              <PageWithLoggedInStatusState
                Page={SignupConfirmed}
                path="/signup_confirmed/*"
              />
              <PageWithLoggedInStatusState
                Page={SigninConfirmed}
                path="/signin_verified/*"
              />
              <PageWithLoggedInStatusState
                Page={SigninConfirmed}
                path="/signin_confirmed/*"
              />

              <Confirm path="/confirm/*" {...{ sessionTokenId }} />
              <ConfirmSignupCode path="/confirm_signup_code/*" />

              <ThirdPartyAuthCallback path="/post_verify/third_party_auth/callback/*" />
            </>
          )}
          <Settings path="/settings/*" {...{ showRecoveryKeyV2 }} />
        </ScrollToTop>
      </Router>
    </>
  );
};

export default App;
