/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { RouteComponentProps, Router } from '@reach/router';
import { ScrollToTop } from '../Settings/ScrollToTop';
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

import CompleteResetPassword, {
  CompleteResetPasswordParams,
} from '../../pages/ResetPassword/CompleteResetPassword';
import ResetPasswordConfirmed from '../../pages/ResetPassword/ResetPasswordConfirmed';
import AccountRecoveryConfirmKey from '../../pages/ResetPassword/AccountRecoveryConfirmKey';
import SignupConfirmed from '../../pages/Signup/SignupConfirmed';
import ConfirmSignupCode from '../../pages/Signup/ConfirmSignupCode';

import SigninReported from '../../pages/Signin/SigninReported';
import LinkValidator from '../LinkValidator';
import { useAccount } from '../../models';

export const App = ({
  flowQueryParams,
}: { flowQueryParams: QueryParams } & RouteComponentProps) => {
  const { showReactApp } = flowQueryParams;
  const account = useAccount();

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

              <LinkValidator
                path="/complete_reset_password/*"
                page="completeResetPassword"
                linkType="reset-password"
              >
                {({ setLinkStatus, params }) => (
                  <CompleteResetPassword
                    params={params as CompleteResetPasswordParams}
                    {...{ setLinkStatus }}
                    account={{
                      hasRecoveryKey: account.hasRecoveryKey,
                      resetPasswordStatus: account.resetPasswordStatus,
                      completeResetPassword: account.completeResetPassword,
                    }}
                  />
                )}
              </LinkValidator>

              <AccountRecoveryConfirmKey path="/account_recovery_confirm_key/*" />

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

              <ConfirmSignupCode path="/confirm_signup_code/*" />
            </>
          )}
          <Settings path="/settings/*" {...{ flowQueryParams }} />
        </ScrollToTop>
      </Router>
    </>
  );
};

export default App;
