/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { ScrollToTop } from '../Settings/ScrollToTop';
import { useInitialState, useAccount, useConfig } from '../../models';
import * as Metrics from '../../lib/metrics';

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
import AccountRecoveryResetPassword from '../../pages/ResetPassword/AccountRecoveryResetPassword';

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>();

  const { showReactApp } = flowQueryParams;
  const { loading, error } = useInitialState();
  const { metricsEnabled } = useAccount();
  const config = useConfig();

  useEffect(() => {
    Metrics.init(metricsEnabled || !isSignedIn, flowQueryParams);
  }, [metricsEnabled, isSignedIn, flowQueryParams]);

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
              <CompleteResetPassword path="/complete_reset_password/*" />
              <AccountRecoveryConfirmKey path="/account_recovery_confirm_key/*" />
              <AccountRecoveryResetPassword path="/account_recovery_reset_password/*" />

              <SigninReported path="/signin_reported/*" />
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

              <ConfirmSignupCode path="/confirm_signup_code/*" />
            </>
          )}
          <Settings path="/settings/*" />
        </ScrollToTop>
      </Router>
    </>
  );
};

export default App;
